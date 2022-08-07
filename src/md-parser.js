import { data, testVisitedCountries } from './codeData';
const nReadlines = require('n-readlines');

export class Parser {
    constructor(md_file) {
        this.md_file = md_file;
        this.visitedCountries = testVisitedCountries;
        this.parse();
    }

    get visitedCountries() {
        return this.visitedCountries;
    }

    static testVisitedCountries() {
        return testVisitedCountries;
    }

    static data() {
        return data;
    }
    // Method
    parse() {
        const mdLines = new nReadlines(this.md_file);

        let line;
        let lineNumber = 1;

        while (line = mdLines.next()) {
            console.log(`Line ${lineNumber} has: ${line.toString('ascii')}`);
            lineNumber++;
        }
    }
}