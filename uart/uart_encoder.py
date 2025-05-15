import json

STX = 0x02
ETX = 0x03

def encode_uart_message(msg: dict) -> bytes:
    body = json.dumps(msg).encode('utf-8')
    length = len(body)
    return bytes([STX]) + length.to_bytes(2, 'big') + body + bytes([ETX])
