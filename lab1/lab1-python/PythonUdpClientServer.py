import socket
import sys

serverIP = "127.0.0.1"
serverPort = 9008
msg = "żółta gęś!"

byte_no = 4


def socket_close(s):
    s.close()


def task2():
    print('PYTHON UDP CLIENT')
    client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    client.sendto(bytes(msg, 'cp1250'), (serverIP, serverPort))
    socket_close(client)


def task3():
    print('PYTHON UDP CLIENT')
    client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    msg_bytes = (300).to_bytes(byte_no, byteorder='little')
    print("Sending... ")
    client.sendto(msg_bytes, (serverIP, serverPort))

    buff, _ = client.recvfrom(byte_no)
    response = int.from_bytes(buff, byteorder='little')
    print("Response: ", response)

    socket_close(client)


def task4_server():
    print('PYTHON UDP SERVER')
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    server_socket.bind(('', serverPort))

    while True:
        buff, address = server_socket.recvfrom(1024)
        print("python udp server received msg: " + str(buff, 'cp1250'))

        if b'Java' in buff:
            message = 'Thank you, Java!'
            server_socket.sendto(bytes(message, 'cp1250'), address)
        elif b'Python' in buff:
            message = 'Thank you, Python!'
            server_socket.sendto(bytes(message, 'cp1250'), address)


def task4_client():
    print('PYTHON UDP CLIENT')
    message = "Ping Python Udp!"

    client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    client.sendto(bytes(message, 'cp1250'), (serverIP, serverPort))

    buff, address = client.recvfrom(1024)
    print("python udp client received msg: " + str(buff, 'cp1250'))


if __name__ == '__main__':
    task = sys.argv[1]
    role = sys.argv[2]
    if not task:
        print("No task argument given, going for the default one...\n")
        task = "zad2"
    if not role:
        print("No role argument given, going for the default one...\n")
        role = "server"

    if task == "zad2":
        task2()
    if task == "zad3":
        task3()
    if task == "zad4":
        if role == "server":
            task4_server()
        if role == "client":
            task4_client()
