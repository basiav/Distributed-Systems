import os
import socket
import threading
from threading import Thread
import sys

import config, utils
from termcolor import colored
import colorama

colorama.init()

tcp_protocol = socket.IPPROTO_TCP
udp_protocol = socket.IPPROTO_UDP

bytes_no = config.bytes_no
active_connections = 5

clients = {}
nicknames = {}


def tcp_create_bind_socket():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM, tcp_protocol)

    try:
        s.bind(config.server_address)
    except OSError:
        exit_connection(s)
        print(colored('Address already taken', 'red'))
        raise SystemExit

    return s


def udp_create_bind_socket():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, udp_protocol)

    try:
        s.bind(config.server_address)
    except OSError:
        exit_connection(s)
        print(colored('Address already taken', 'red'))
        raise SystemExit

    return s


def handle_client(connection, client_address):
    ip, port = client_address
    print(colored(f'New connection from {ip}:{port} [{connection}]', 'green'))
    clients[client_address] = connection

    while True:
        try:
            msg = connection.recv(bytes_no)

            if msg:
                # Calls broadcast function to send message to all
                print(colored(f'[TCP] {msg}', 'yellow'))
                broadcast(msg, connection)

            else:
                remove(connection)

        except Exception as e:
            print(colored(f'[SERVER] [handle_client] Error: {e}', 'red'))
            continue


def tcp_accept_connection(server_socket):
    while True:
        try:
            connection, client_address = server_socket.accept()
            connection.sendall('NICK'.encode('ascii'))
            nickname = connection.recv(bytes_no).decode('ascii')

            if len(clients) < config.max_clients:
                client_thread = Thread(target=handle_client, args=(connection, client_address))
                client_thread.start()
                clients[client_address] = connection
                nicknames[client_address] = nickname
            else:
                exit_connection(connection)
                ip, port = client_address
                print(colored(f'Connection from {ip}:{port} denied, too many clients', 'red'))

        except OSError:
            exit_connection(tcp_socket)
            return


def receive_udp(udp_socket):
    while True:
        try:
            data, client_address = udp_socket.recvfrom(bytes_no)
            print(colored(f'[UDP] {data}', 'blue'))
        except OSError:
            exit_connection(udp_socket)
            return

        for client in clients.keys():
            if client != client_address:
                try:
                    udp_socket.sendto(data, client)
                except Exception as e:
                    print(colored(f'[SERVER] [receive_udp] Error: {e}', 'red'))
                    continue


def listen_on_commands():
    quit_commands = ['Exit', 'exit', 'q', 'quit']
    while True:
        try:
            for line in sys.stdin:
                if any(c in line.rstrip() for c in quit_commands):
                    print(colored('[SERVER] Quitting, bye...', 'orange'))
                    exit_connection(tcp_socket)
                    exit_connection(udp_socket)
                    sys.exit(0)
        except KeyboardInterrupt:
            print(colored('[SERVER] Interrupted', 'red'))
            try:
                exit_connection(tcp_socket)
                exit_connection(udp_socket)
                sys.exit(0)
            except Exception as e:
                print(colored(f'[SERVER] [listen_on_commands] Error: {e}', 'red'))
            except SystemExit:
                os._exit(0)


def create_activate_tcp_connection_thread(tcp_socket):
    Thread(target=tcp_accept_connection, args=(tcp_socket,)).start()


def create_udp_thread(udp_socket):
    Thread(target=receive_udp, args=(udp_socket,)).start()


def broadcast(message, connection):
    for c in clients.values():
        if c != connection:
            try:
                c.sendall(message)
            except Exception as e:
                print(colored(f'[SERVER] [broadcast] {e}', 'red'))
                exit_connection(connection)
                remove(c)


def exit_connection(connection):
    try:
        connection.shutdown(socket.SHUT_RDWR)
    except Exception as e:
        print(f'[SERVER] [exit_connection] Error: {e}')

    connection.close()
    remove(connection)


def remove(connection):
    if connection in clients:
        del clients[connection]


def join_threads():
    for thread in threading.enumerate():
        if thread != threading.main_thread():
            thread.join()


if __name__ == '__main__':
    print('Python Chat Server')
    print('Press Ctrl+C to exit')

    tcp_socket = tcp_create_bind_socket()
    tcp_socket.listen(active_connections)
    create_activate_tcp_connection_thread(tcp_socket)

    udp_socket = udp_create_bind_socket()
    create_udp_thread(udp_socket)

    listen_on_commands()

    join_threads()
