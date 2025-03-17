export class Transaction {
  id: Id;
  sender: string;
  receiver: string;
  amount: number;
  gasFee: number;

  constructor(
    id: Id,
    sender: string,
    receiver: string,
    amount: number,
    gasFee: number,
  ) {
    this.id = id;
    this.sender = sender;
    this.receiver = receiver;
    this.amount = amount;
    this.gasFee = gasFee;
  }
}
