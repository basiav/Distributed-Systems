import socket
from threading import Thread

import config
from termcolor import colored

tcp_protocol = socket.IPPROTO_TCP
bytes_no = config.bytes_no
active_connections = 5

clients = []


def tcp_create_bind_socket():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM, tcp_protocol)

    try:
        s.bind(config.server_address)
    except OSError:
        s.close()
        print(colored('Address already taken', 'red'))
        raise SystemExit

    return s


def create_activate_tcp_connection_thread():
    Thread(target=tcp_accept_connection, args=(socket,)).start()


def handle_client(connection, address):
    ip, port = address
    print(colored(f'New connection from {ip}:{port}', 'green'))
    clients[address] = connection

    while True:
        try:
            msg = connection.recvfrom(bytes_no)

            if msg:
                # Calls broadcast function to send message to all
                message_to_send = "<" + address[0] + "> " + msg
                broadcast(message_to_send, connection)

            else:
                remove(connection)

        except:
            continue


def broadcast(message, connection):
    for c in clients:
        if c != connection:
            try:
                c.send(message)
            except:
                c.close()
                remove(c)


def tcp_accept_connection(serversocket):
    while True:
        connection, address = serversocket.accept()
        if len(clients) < config.max_clients:
            client_thread = Thread(target=handle_client, args=(connection, address))
            client_thread.start()
        else:
            connection.close()
            ip, port = address
            print(colored(f'Connection from {ip}:{port} denied, too many clients', 'red'))


def remove(connection):
    if connection in clients:
        clients.remove(connection)


if __name__ == '__main__':
    print('Python Chat Server')
    print('Press Ctrl+C to exit')

    socket = tcp_create_bind_socket()
    socket.listen(active_connections)

    create_activate_tcp_connection_thread()