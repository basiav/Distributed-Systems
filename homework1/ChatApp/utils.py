import os
import sys
import threading

import config

from termcolor import colored
import colorama

colorama.init()


def listen_on_quitting_commands(tcp_exit_connection, udp_exit_connection):
    while True:
        try:
            for line in sys.stdin:
                if any(c in line.rstrip() for c in config.quit_commands):
                    print(colored('Quitting, bye...', 'magenta'))
                    tcp_exit_connection()
                    udp_exit_connection()
                    try:
                        # raise SystemExit
                        # sys.exit(0)
                        quit()
                    except Exception as e:
                        print(colored(f'[listen_on_quitting_commands] Error: {e}', 'red'))
        except KeyboardInterrupt:
            print(colored('Interrupted', 'red'))
            try:
                tcp_exit_connection()
                udp_exit_connection()
                # raise SystemExit
                quit()
                sys.exit(0)
            except Exception as e:
                print(colored(f'[listen_on_quitting_commands] Error: {e}', 'red'))
            except SystemExit:
                os._exit(0)
        except Exception as e:
            print(colored(f'[listen_on_quitting_commands] Error: {e}', 'red'))


def join_threads():
    for thread in threading.enumerate():
        if thread != threading.main_thread():
            thread.join()
