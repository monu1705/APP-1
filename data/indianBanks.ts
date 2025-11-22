export interface BankData {
    id: string;
    name: string;
    logo: string; // URL or local path
    color: string;
    initials: string;
}

export const popularBanks: BankData[] = [
    {
        id: 'sbi',
        name: 'State Bank of India',
        logo: 'https://logo.clearbit.com/sbi.co.in',
        color: '#280071',
        initials: 'SBI'
    },
    {
        id: 'hdfc',
        name: 'HDFC Bank',
        logo: 'https://logo.clearbit.com/hdfcbank.com',
        color: '#004c8f',
        initials: 'HDFC'
    },
    {
        id: 'icici',
        name: 'ICICI Bank',
        logo: 'https://logo.clearbit.com/icicibank.com',
        color: '#f37e20',
        initials: 'ICICI'
    },
    {
        id: 'axis',
        name: 'Axis Bank',
        logo: 'https://logo.clearbit.com/axisbank.com',
        color: '#97144d',
        initials: 'AXIS'
    },
    {
        id: 'kotak',
        name: 'Kotak Mahindra Bank',
        logo: 'https://logo.clearbit.com/kotak.com',
        color: '#ed1b24',
        initials: 'KOTAK'
    },
    {
        id: 'pnb',
        name: 'Punjab National Bank',
        logo: 'https://logo.clearbit.com/pnbindia.in',
        color: '#a20a3a',
        initials: 'PNB'
    },
    {
        id: 'bob',
        name: 'Bank of Baroda',
        logo: 'https://logo.clearbit.com/bankofbaroda.in',
        color: '#f26522',
        initials: 'BOB'
    },
    {
        id: 'union',
        name: 'Union Bank of India',
        logo: 'https://logo.clearbit.com/unionbankofindia.co.in',
        color: '#e71d2b',
        initials: 'UBI'
    },
    {
        id: 'canara',
        name: 'Canara Bank',
        logo: 'https://logo.clearbit.com/canarabank.com',
        color: '#005b9f',
        initials: 'CB'
    },
    {
        id: 'idfc',
        name: 'IDFC FIRST Bank',
        logo: 'https://logo.clearbit.com/idfcfirstbank.com',
        color: '#9d1d27',
        initials: 'IDFC'
    },
    {
        id: 'indusind',
        name: 'IndusInd Bank',
        logo: 'https://logo.clearbit.com/indusind.com',
        color: '#8d0b1d',
        initials: 'IND'
    },
    {
        id: 'yes',
        name: 'Yes Bank',
        logo: 'https://logo.clearbit.com/yesbank.in',
        color: '#005b9f',
        initials: 'YES'
    }
];
