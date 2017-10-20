export class WSMessage {
  opcode: string;
  body: string;


  constructor(opcode: string, body: any) {
    this.opcode = opcode;
    this.body = (typeof body === 'object') ? JSON.stringify(body) : `${body}`;
  }
}
