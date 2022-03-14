import socket
from threading import Thread

import config
from termcolor import colored

tcp_protocol = socket.IPPROTO_TCP
bytes_no = config.bytes_no
active_connections = 5

clients = []
nicknames = []


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


def create_activate_tcp_connection_thread(tcp_socket):
    Thread(target=tcp_accept_connection, args=(tcp_socket,)).start()


def handle_client(connection, address):
    ip, port = address
    print(colored(f'New connection from {ip}:{port}', 'green'))
    # clients[address] = connection

    while True:
        try:
            msg = connection.recv(bytes_no)
            print("MSG", msg)
            # broadcast(msg, connection)

            if msg:
                # Calls broadcast function to send message to all
                print("Broadcasting...")
                broadcast(msg, connection)

            else:
                remove(connection)

        except Exception as e:
            print(colored(f'[SERVER] [handle_client] Error: {e}', 'red'))
            continue


def tcp_accept_connection(server_socket):
    while True:
        connection, address = server_socket.accept()
        connection.send('NICK'.encode('ascii'))
        nickname = connection.recv(bytes_no).decode('ascii')

        if len(clients) < config.max_clients:
            client_thread = Thread(target=handle_client, args=(connection, address))
            client_thread.start()
            clients.append(connection)
        else:
            exit_connection(connection)
            ip, port = address
            print(colored(f'Connection from {ip}:{port} denied, too many clients', 'red'))


def broadcast(message, connection):
    for c in clients:
        # if c != connection:
        #     try:
        #         c.send(message)
        #     except:
        #         exit_connection(connection)
        #         remove(c)
        try:
            c.send(message)
        except Exception as e:
            print(e)
            exit_connection(connection)
            remove(c)


def exit_connection(connection):
    try:
        socket.shutdown(connection)
    except Exception as e:
        print(f'[SERVER] [exit_connection] Error: {e}')

    connection.close()

    remove(connection)


def remove(connection):
    if connection in clients:
        clients.remove(connection)


if __name__ == '__main__':
    print('Python Chat Server')
    print('Press Ctrl+C to exit')

    socket = tcp_create_bind_socket()
    socket.listen(active_connections)

    create_activate_tcp_connection_thread(socket)
