import socket
from threading import Thread

from termcolor import colored

import config

tcp_protocol = socket.IPPROTO_TCP
bytes_no = config.bytes_no


def tcp_create_connect_socket():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM, tcp_protocol)

    try:
        s.connect(config.server_address)
    except ConnectionRefusedError:
        print(colored('Server unavailable', 'red'))
        raise SystemExit
    # _, tcp_port = s.getsockname()

    return s


def chose_a_nickname():
    while True:
        try:
            nickname = input('Choose a nickname: ')
        except KeyboardInterrupt:
            raise SystemExit
        if nickname:
            break

    return nickname


def receive():
    while True:
        try:
            msg = client_socket.recvfrom(bytes_no).decode('ascii')
            if msg == 'NICK':
                client_socket.send(nick.encode('ascii'))
            else:
                print(msg)
        except:
            print("Error")
            client_socket.close()
            break


def write():
    while True:
        msg = f'{nick}: {input("")}'
        client_socket.send(msg.encode(('ascii')))


if __name__ == '__main__':
    print('Python Chat Client')
    print('Press Ctrl+C to exit')

    nick = chose_a_nickname()

    client_socket = tcp_create_connect_socket()

    receive_thread = Thread(target=receive)
    receive_thread.start()

    write_thread = Thread(target=write)
    write_thread.start()
