import fs from 'fs';
import path from 'path';

const pages = [
  { file: 'Home.jsx', comp: 'Home', title: 'Best Customer Loyalty Program | Earn Cashback Offers', desc: 'Join the best customer loyalty program! Earn reward points, get the highest cashback deals, and redeem rewards on daily shopping. Start earning today!' },
  { file: 'GiftCards.jsx', comp: 'GiftCards', title: 'Buy Gift Cards & Earn Loyalty Points | Assured Rewards', desc: 'Shop top brand gift cards and earn loyalty points on every purchase. Enjoy exclusive member benefits and get the best cashback offers instantly with us.' },
  { file: 'Brands.jsx', comp: 'Brands', title: 'Top Brands Loyalty Discounts & Rewards | Assured Rewards', desc: 'Explore our partner brands to earn loyalty points and daily rewards deals. Get exclusive member benefits and repeat customer offers on your shopping.' },
  { file: 'Store.jsx', comp: 'Store', title: 'Earn Cashback Online | Redeem Rewards at Assured Rewards', desc: 'Shop at the Assured Rewards store to earn cashback online and bonus reward points. Find the highest cashback deals and redeem rewards seamlessly here.' },
  { file: 'AboutUs.jsx', comp: 'AboutUs', title: 'About Assured Rewards | Best Loyalty Rewards Program', desc: 'Discover how Assured Rewards is building the best loyalty rewards program. We aim to reward loyal customers with top cashback offers and loyalty points.' },
  { file: 'ContactUs.jsx', comp: 'ContactUs', title: 'Contact Assured Rewards | Support for Loyalty Points', desc: 'Need help with your cashback on shopping or bonus reward points? Contact the Assured Rewards support team today. We value and reward loyal customers.' },
  { file: 'HelpSupport.jsx', comp: 'HelpSupport', title: 'Help Center | Guide to Earn Reward Points & Cashback', desc: 'Have questions about our customer loyalty programs? Visit our Help Center to learn how to earn loyalty points, redeem rewards, and use cashback coupons.' },
  { file: 'BrandFAQs.jsx', comp: 'BrandFAQs', title: 'Brand FAQs | Loyalty Promotions & Cashback Offers', desc: 'Find answers to FAQs about brand loyalty promotions, bank cashback offers, and loyalty membership deals. Maximize your benefits with Assured Rewards.' },
  { file: 'HowVerifyWorks.jsx', comp: 'HowVerifyWorks', title: 'How Verify Works | Secure Cashback & Reward Points', desc: 'Learn how our verification process ensures you safely earn reward points and get cashback on payment. Enjoy secure and fast loyalty rewards processing.' },
  { file: 'PrivacyPolicy.jsx', comp: 'PrivacyPolicy', title: 'Privacy Policy | Secure Customer Loyalty Program', desc: 'Read the Privacy Policy of Assured Rewards. We protect your data while you earn cashback online, use cash back apps, and enjoy our rewards program safely.' },
  { file: 'TermsConditions.jsx', comp: 'TermsConditions', title: 'Terms & Conditions | Assured Rewards Loyalty Program', desc: 'Review the Terms and Conditions for our loyalty rewards program. Understand the rules to earn loyalty points, redeem rewards, and use cashback coupons.' },
  { file: 'ReturnRefund.jsx', comp: 'ReturnRefund', title: 'Return & Refund Policy | Assured Rewards Shopping', desc: 'Check our Return and Refund Policy for purchases made using loyalty points or cashback on shopping. We strive to provide the best customer experience.' },
  { file: 'VendorLandingPage.jsx', comp: 'VendorLandingPage', title: 'Loyalty Program for Small Business | Vendor Portal', desc: 'Grow your store with our loyalty program for small business. Partner with Assured Rewards to offer loyalty promotions and reward loyal customers today.' },
  { file: 'VendorPrivacyPolicy.jsx', comp: 'VendorPrivacyPolicy', title: 'Vendor Privacy Policy | Secure Loyalty Program Data', desc: 'Read our Vendor Privacy Policy. Assured Rewards ensures your business data is safe while you manage your customer loyalty programs and cashback offers.' },
  { file: 'VendorTerms.jsx', comp: 'VendorTerms', title: 'Vendor Terms | Partner for Loyalty Membership Deals', desc: 'Review the Vendor Terms for partnering with Assured Rewards. Learn the guidelines for running loyal customer discounts and daily rewards deals with us.' },
  { file: 'VendorFAQs.jsx', comp: 'VendorFAQs', title: 'Vendor FAQs | Loyalty Program for Small Business Help', desc: 'Get answers on how to set up your loyalty program for small business. Learn about managing bonus reward points, cashback offers, and vendor benefits.' }
];

const basePath = 'c:/Users/kshit/Desktop/code/react/web-app/cashback/src/pages';

pages.forEach(p => {
  const filepath = path.join(basePath, p.file);
  if (!fs.existsSync(filepath)) {
    console.log('Not found:', p.file);
    return;
  }
  let content = fs.readFileSync(filepath, 'utf8');
  
  if (content.includes('useSEO(')) {
    console.log('Already has useSEO:', p.file);
    return;
  }

  // Insert import
  const importStatement = 'import { useSEO } from "../hooks/useSEO";\n';
  const lastImportIndex = content.lastIndexOf('import ');
  if (lastImportIndex !== -1) {
    const endOfImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfImport + 1) + importStatement + content.slice(endOfImport + 1);
  } else {
    content = importStatement + content;
  }

  const hookCall = `\n  useSEO(\n    "${p.title}",\n    "${p.desc}"\n  );\n`;
  
  // Regex to match "const Home = () => {" or "const Home = (props) => {"
  const regex = new RegExp(`(const ${p.comp}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*{)`);
  const match = content.match(regex);
  if (match) {
    content = content.replace(regex, `$1${hookCall}`);
    fs.writeFileSync(filepath, content);
    console.log('Updated:', p.file);
  } else {
    const regexFunc = new RegExp(`(function ${p.comp}\\s*\\([^)]*\\)\\s*{)`);
    const matchFunc = content.match(regexFunc);
    if (matchFunc) {
      content = content.replace(regexFunc, `$1${hookCall}`);
      fs.writeFileSync(filepath, content);
      console.log('Updated (func):', p.file);
    } else {
      console.log('Could not find component definition for:', p.file);
    }
  }
});
