import socket
from threading import Thread

from termcolor import colored
import colorama

import config
import utils

colorama.init()

tcp_protocol = socket.IPPROTO_TCP
udp_protocol = socket.IPPROTO_UDP
bytes_no = config.bytes_no


def tcp_create_connect_socket():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM, tcp_protocol)

    try:
        s.connect(config.server_address)
    except ConnectionRefusedError:
        print(colored('Server unavailable', 'red'))
        raise SystemExit

    return s


def udp_create_bind_socket(tcp_port):
    udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, udp_protocol)
    udp_sock.bind(('', tcp_port))
    return udp_sock


def receive_tcp():
    while True:
        try:
            tcp_msg = tcp_socket.recv(bytes_no).decode('ascii')

            if tcp_msg == 'NICK':
                tcp_socket.sendall(nick.encode('ascii'))
            else:
                print(colored(f'[TCP MSG]: {tcp_msg}', 'yellow'))

        except Exception as e:
            print(f'[CLIENT] [receive_tcp] Error: {e}')
            tcp_socket.close()
            return


def receive_udp():
    while True:
        try:
            udp_msg = udp_socket.recv(bytes_no).decode('ascii')

            if udp_msg:
                print(colored(f'[UDP msg received]: {udp_msg}', 'blue'))

        except Exception as e:
            print(f'[CLIENT] [receive_udp] Error: {e}')
            udp_socket.close()
            return


def write():
    while True:
        msg = f'{nick}: {input("")}'
        if 'U' in msg:
            udp_socket.sendto(msg.encode('ascii'), config.server_address)
        else:
            tcp_socket.sendall(msg.encode('ascii'))


def chose_a_nickname():
    while True:
        try:
            nickname = input('Choose a nickname: ')
        except KeyboardInterrupt:
            raise SystemExit
        if nickname:
            break
    return nickname


def exit_connection(connection):
    try:
        connection.shutdown(socket.SHUT_RDWR)
    except Exception as e:
        print(f'[CLIENT] [exit_connection] Error: {e}')

    connection.close()


if __name__ == '__main__':
    print('Python Chat Client')
    print('Press Ctrl+C to exit')

    nick = chose_a_nickname()

    tcp_socket = tcp_create_connect_socket()
    _, tcp_port = tcp_socket.getsockname()
    udp_socket = udp_create_bind_socket(tcp_port)

    receive_tcp_thread = Thread(target=receive_tcp)
    receive_tcp_thread.start()

    receive_udp_thread = Thread(target=receive_udp)
    receive_udp_thread.start()

    write_thread = Thread(target=write)
    write_thread.start()

    utils.listen_on_quitting_commands(lambda: exit_connection(tcp_socket), lambda: exit_connection(udp_socket))

    utils.join_threads()
