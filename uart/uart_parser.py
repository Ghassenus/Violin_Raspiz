STX = 0x02
ETX = 0x03

class UARTParser:
    def __init__(self):
        self.buffer = bytearray()

    def feed(self, data: bytes):
        self.buffer.extend(data)

    def next_message(self):
        while len(self.buffer) >= 4:
            if self.buffer[0] != STX:
                self.buffer.pop(0)
                continue

            if len(self.buffer) < 3:
                return None

            length = int.from_bytes(self.buffer[1:3], 'big')
            if len(self.buffer) < 3 + length + 1:
                return None

            if self.buffer[3 + length] != ETX:
                self.buffer.pop(0)
                continue

            json_bytes = self.buffer[3:3 + length]
            del self.buffer[:3 + length + 1]

            try:
                import json
                return json.loads(json_bytes.decode('utf-8'))
            except Exception:
                continue
