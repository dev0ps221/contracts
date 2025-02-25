#!/usr/bin/env node
const Models = require('./models')
const {Contract,Fact,Intervenant,Goal,Group} = Models
const Managers = require('./managers')
class Encrypt{
    strToBinary(text) {
        return text.split('')
            .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
            .join('');
    }
    
    binaryToStr(binary) {
        return binary.match(/.{1,8}/g) // Split into 8-bit chunks
            .map(bin => String.fromCharCode(parseInt(bin, 2)))
            .join('');
    }
    
    crypt(text, shift) {
        let binary = this.strToBinary(text);
        let shifted = BigInt('0b' + binary) << BigInt(shift);
        return shifted.toString(2); // Return as binary string
    }
    
    uncrypt(binary, shift) {
        let shiftedBack = BigInt('0b' + binary) >> BigInt(shift);
        let binaryStr = shiftedBack.toString(2);
        while (binaryStr.length % 8 !== 0) {
            binaryStr = '0' + binaryStr; // Ensure it aligns to 8-bit groups
        }
        return this.binaryToStr(binaryStr);
    }
}
class Contracts
{
    contracts = []
    groups    = []
    users     = []
    crypt     = new Encrypt()
    setup     = null
    Encrypt(string,key=7)
    {
        return this.crypt.crypt(string,key)
    }
    Decrypt(string,key=7)
    {
        return this.crypt.uncrypt(string,key)
    }
    constructor(setup)
    {
        this.setup = setup
        this.app = new Managers.App(this)
    }
}

module.exports = { Contracts, Models}