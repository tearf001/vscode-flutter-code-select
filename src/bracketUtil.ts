'use strict';

export namespace bracketUtil {
    const vs = require("vscode");
    let openBracket = vs.workspace.getConfiguration('flutter-code-select').get('openBracket');
    let closeBracket = vs.workspace.getConfiguration('flutter-code-select').get('closeBracket');
    let sameBracket = vs.workspace.getConfiguration('flutter-code-select').get('sameBracket');

    export function isMatch(open: string, close: string): Boolean {
        let opentIndex = openBracket.indexOf(open)
        if (opentIndex >= 0) {
            return closeBracket[opentIndex] == close;
        } else if (isSameBracket(open)) {
            return open == close;
        }
        return false;
    }

    export function isOpenBracket(char: string): Boolean {
        return openBracket.indexOf(char) >= 0;
    }

    export function isCloseBracket(char: string): Boolean {
        return closeBracket.indexOf(char) >= 0;
    }

    export function isSameBracket(char: string): Boolean {
        return sameBracket.indexOf(char) >= 0;
    }
}