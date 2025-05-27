export class Message {
  type: string;
  data: string;

  constructor(type: string, data: string) {
    this.type = type;
    this.data = data;
  }
}