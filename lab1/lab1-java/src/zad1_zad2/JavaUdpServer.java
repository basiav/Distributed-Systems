package zad1_zad2;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Arrays;

public class JavaUdpServer {

    public static void main(String args[])
    {
        System.out.println("JAVA UDP SERVER");
        DatagramSocket socket = null;
        int portNumber = 9008;

        try{
            socket = new DatagramSocket(portNumber);
            byte[] receiveBuffer = new byte[1024];

            while(true) {
                Arrays.fill(receiveBuffer, (byte)0);
                DatagramPacket receivePacket = new DatagramPacket(receiveBuffer, receiveBuffer.length);
                socket.receive(receivePacket);

                // Receive packet
                String msg = new String(receivePacket.getData(), ("Cp1250"));
                System.out.println("received msg: " + msg.trim());
                String address = String.valueOf(receivePacket.getAddress());
                String socketAddress = String.valueOf(receivePacket.getSocketAddress());
                String port = String.valueOf(receivePacket.getPort());
                System.out.println("[received from] address: " + address +
                        " socketAddress: " + socketAddress + " port:" +  port);


                // Send response back
                InetAddress addressBack = receivePacket.getAddress();
                int sourcePortNumber = receivePacket.getPort();
                byte[] sendBuffer = "Ping Java Udp from Server".getBytes();
                DatagramPacket sendPacket = new DatagramPacket(sendBuffer, sendBuffer.length, addressBack, sourcePortNumber);
                socket.send(sendPacket);

            }
        }
        catch(Exception e){
            e.printStackTrace();
        }
        finally {
            if (socket != null) {
                socket.close();
            }
        }
    }
}
