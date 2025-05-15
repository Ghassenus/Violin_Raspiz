import threading
from uart_parser import UARTParser
from uart_encoder import encode_uart_message
from uart_protocol import validate_message


class UARTDispatcher:
    def __init__(self, serial_port):
        self.ser = serial_port
        self.parser = UARTParser()
        self.handlers = {}
        self.running = False

    def register(self, msg_type: str, handler):
        self.handlers[msg_type] = handler

    def send(self, message: dict):
        raw = encode_uart_message(message)
        self.ser.write(raw)

    def start(self):
        self.running = True
        threading.Thread(target=self._loop, daemon=True).start()

    def stop(self):
        self.running = False

    def _loop(self):
        while self.running:
            data = self.ser.read(self.ser.in_waiting or 1)
            if data:
                self.parser.feed(data)
                while True:
                    msg = self.parser.next_message()
                    if msg is None:
                        break
                    err = validate_message(msg)
                    if err:
                        print("⚠️ Message ignoré :", err)
                        continue
                    handler = self.handlers.get(msg.get("type"))
                    if handler:
                        handler(msg)
