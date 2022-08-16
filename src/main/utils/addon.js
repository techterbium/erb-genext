const gka = () => 'auNaNhRf';
const gkb = () => 'plmqIb4H';
const gkc = () => 'jwLw83Nj';

const getStrongKey = () => {
  const a = gka();
  const b = gkb();
  const c = gkc();

  return `${a}${b}${c}`;
};

export default getStrongKey;
