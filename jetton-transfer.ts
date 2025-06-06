import { beginCell, Address, toNano, internal, SendMode, JettonMaster, external } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as fs from 'fs';
import { getClient } from './utils/get-client';
import { getWalletContract } from './utils/get-wallet';
import { ta } from './utils/tonapi-client';
import { getTransactionDetails } from './utils/get-transaction';
import { delay } from './utils/delay';

async function createJetton() {
  const client = await getClient('testnet');
  const mnemonic = fs.readFileSync('./seeds-1.txt', 'utf8');
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const wallet = await getWalletContract(client, keyPair.publicKey);

  const senderAddress = wallet.address;
  const destinationAddress = Address.parse('0QDb3axXrinnvA2TKJrnOMLjvrh28aIoq6YSpIqyOUAMQrDM');
  const jettonMasterAddress = Address.parse('EQCS26P5WyHZ4gzuYnb4yDOvFOSFG1A1VZMi79w51uEBB823');
  const jettonAmount = toNano(100);
  // Base gas fee required for the jetton transfer
  const BASE_JETTON_SEND_AMOUNT = toNano(0.05);

  // -------------------------------------------

  const jettonTransferPayload = beginCell()
    .storeUint(0xf8a7ea5, 32) // JETTON_TRANSFER_OP_CODE (operation identifier)
    .storeUint(0, 64) // Query ID (0 for new transactions)
    .storeCoins(jettonAmount) // Amount to transfer (1 USDt)
    .storeAddress(destinationAddress) // Recipient address
    .storeAddress(wallet.address) // Address to receive excess funds (usually address of sender)
    .storeBit(false) // No custom payload
    .storeCoins(1n) // Forward fee in nanoTON (for send notify to wallet)
    .storeMaybeRef(undefined)
    .endCell();

  const JettonMasterContract = JettonMaster.create(jettonMasterAddress);
  const jettonMasterContract = client.open(JettonMasterContract);
  const senderJettonWallet = await jettonMasterContract.getWalletAddress(senderAddress);

  // Get the current seqno (sequence number) for the wallet transaction
  let seqno: number = await wallet.getSeqno();

  const transfer = await wallet.createTransfer({
    seqno, // Required to ensure transaction uniqueness
    secretKey: keyPair.secretKey, // Sign the transaction with the private key
    sendMode: SendMode.PAY_GAS_SEPARATELY, // Specify send mode
    messages: [
      internal({
        to: senderJettonWallet, // Sending to the sender's jetton wallet
        value: BASE_JETTON_SEND_AMOUNT, // Gas fee
        body: jettonTransferPayload // Jetton transfer payload
      })
    ]
  });

  await wallet.send(transfer);

  await delay(10000);

  const extMessage = external({
    to: wallet.address,
    body: transfer
  });
  await getTransactionDetails(ta, extMessage);
}

createJetton().catch(console.error);