‏
‏
‏  
‏
‏
‏
‏import { getHttpEndpoint } from "@ton/ton";
‏import { TonClient, Cell, Address, toNano, fromNano } from "@ton/ton";
‏import { mnemonicToPrivateKey } from "@ton/crypto";
‏import * as fs from 'fs';
‏import { CONFIG } from "./config";
‏
‏async function main() {
‏  // طلب كلمات المفتاح (mnemonic) من المستخدم
‏  const mnemonic = process.env.MNEMONIC || prompt('أدخل كلمات المفتاح (mnemonic) price legal join item always seed friend grid occur athlete obtain eager around need quality decrease powder together near violin broccoli trophy wild loan):');
‏  
‏  if (!mnemonic) {
‏    console.error('لم يتم توفير كلمات المفتاح!');
‏    process.exit(1);
‏  }
‏  
‏  try {
‏    // إنشاء المفاتيح من الكلمات
‏    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
‏    
‏    // إنشاء عميل TON
‏    const endpoint = getHttpEndpoint(CONFIG.IS_TESTNET);
‏    const client = new TonClient({ endpoint });
‏    
‏    // التحقق من رصيد المحفظة
‏    const wallet = client.open(keyPair);
‏    const balance = await wallet.getBalance();
‏    
‏    console.log(`رصيد المحفظة: ${fromNano(balance)} TON`);
‏    
‏    if (balance < toNano(CONFIG.DEPLOY_AMOUNT)) {
‏      console.error(`رصيد غير كافٍ! تحتاج على الأقل ${CONFIG.DEPLOY_AMOUNT} TON للنشر.`);
‏      process.exit(1);
‏    }
‏    
‏    // قراءة ملفات العقود المترجمة
‏    const minterCode = Cell.fromBoc(fs.readFileSync('./build/jetton-minter.cell'))[0];
‏    const walletCode = Cell.fromBoc(fs.readFileSync('./build/jetton-wallet.cell'))[0];
‏    
‏    // إنشاء خلية الميتاداتا
‏    const contentCell = createOffchainMetadataCell(CONFIG.METADATA_URL);
‏    
‏    // إنشاء بيانات عقد صانع الجيتون
‏    const minterData = beginCell()
‏      .storeCoins(0) // التوريد الإجمالي (سيتم تعيينه عند الإصدار)
‏      .storeRef(contentCell) // محتوى الميتاداتا
‏      .storeAddress(Address.parse(CONFIG.OWNER_ADDRESS)) // عنوان المالك
‏      .storeRef(walletCode) // كود محفظة الجيتون
‏      .endCell();
‏    
‏    // إنشاء عقد صانع الجيتون
‏    const minterContract = new JettonMinter(minterCode, minterData);
‏    
‏    // حساب عنوان العقد
‏    const minterAddress = await minterContract.getAddress();
‏    console.log(`عنوان عقد صانع الجيتون: ${minterAddress.toString()}`);
‏    
‏    // نشر العقد
‏    console.log('جارٍ نشر عقد صانع الجيتون...');
‏    await wallet.sendDeploy(minterContract);
‏    
‏    console.log('تم نشر العقد بنجاح!');
‏    console.log('الخطوات التالية:');
‏    console.log(`1. قم بإصدار الكمية الأولية من العملة بإرسال رسالة "mint" إلى العقد`);
‏    console.log(`2. أضف العملة إلى محفظتك باستخدام عنوان العقد: ${minterAddress.toString()}`);
‏  } catch (error) {
‏    console.error('حدث خطأ أثناء النشر:', error);
‏    process.exit(1);
‏  }
‏}
‏
‏// دالة لإنشاء خلية ميتاداتا خارجية
‏function createOffchainMetadataCell(url: string): Cell {
‏  const urlBuffer = Buffer.from(url);
‏  return beginCell()
‏    .storeUint(0, 8) // نوع الميتاداتا (0 = خارجية)
‏    .storeBuffer(urlBuffer)
‏    .endCell();
‏}
‏
‏// فئة JettonMinter لإنشاء وإدارة العقد
‏class JettonMinter {
‏  constructor(private code: Cell, private data: Cell) {}
‏  
‏  async getAddress(): Promise<Address> {
‏    // حساب عنوان العقد
‏    const stateInit = {
‏      code: this.code,
‏      data: this.data
‏    };
‏    return contractAddress(stateInit);
‏  }
‏}
‏
‏main();
