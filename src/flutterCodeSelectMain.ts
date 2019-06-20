'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { bracketUtil } from './bracketUtil';

class SearchResult {
    bracket: string;
    offset: number;

    constructor(bracket: string, offset: number) {
        this.bracket = bracket;
        this.offset = offset;
    }
}

function findBackward(text: string, index: number): SearchResult {
    const bracketStack: string[] = [];
    for (let i = index; i >= 0; i--) {
        let char = text.charAt(i);
        // if it's a quote, we can not infer it is a open or close one 
        //so just return, this is for the case current selection is inside a string; 
        if (bracketUtil.isQuoteBracket(char) && bracketStack.length == 0) {
            return new SearchResult(char, i);
        }
        if (bracketUtil.isOpenBracket(char)) {
            if (bracketStack.length == 0) {
                return new SearchResult(char, i);
            } else {
                let top = bracketStack.pop();
                if (!bracketUtil.isMatch(char, top)) {
                    throw 'Unmatched bracket pair';
                }
            }
        } else if (bracketUtil.isCloseBracket(char)) {
            bracketStack.push(char);
        }
    }
    //we are get to edge
    return null;
}

function findForward(text: string, index: number): SearchResult {
    const bracketStack: string[] = [];
    for (let i = index; i < text.length; i++) {
        let char = text.charAt(i);
        if (bracketUtil.isQuoteBracket(char) && bracketStack.length == 0) {
            return new SearchResult(char, i);
        }
        if (bracketUtil.isCloseBracket(char)) {
            if (bracketStack.length == 0) {
                return new SearchResult(char, i);
            } else {
                let top = bracketStack.pop();
                if (!bracketUtil.isMatch(top, char)) {
                    throw 'Unmatched bracket pair'
                }
            }
        } else if (bracketUtil.isOpenBracket(char)) {
            bracketStack.push(char);
        }
    }
    return null;
}

function showInfo(msg: string): void {
    vscode.window.showInformationMessage(msg);
}

function getSearchContext() {
    const editor = vscode.window.activeTextEditor;
    const selection = editor.selection;
    let selectionStart = editor.document.offsetAt(editor.selection.anchor);
    let selectionEnd = editor.document.offsetAt(editor.selection.active);
    if (selection.isReversed) {
        //exchange
        [selectionStart, selectionEnd] = [selectionEnd, selectionStart]
    }
    var r = {
        backwardStarter: selectionStart - 1,
        forwardStarter: selectionEnd,
        text: editor.document.getText()
    };
    //console.log('backwardStarter',r.backwardStarter,'forwardStarter',r.forwardStarter,'\n','text',r.text);
    return r;
}

function doSelection(start: number, end: number) {
    const editor = vscode.window.activeTextEditor;
    editor.selection = new vscode.Selection(
        editor.document.positionAt(start + 1), //convert text index to vs selection index
        editor.document.positionAt(end));
}
function isMatch(r1: SearchResult, r2: SearchResult) {
    return r1 != null && r2 != null && bracketUtil.isMatch(r1.bracket, r2.bracket);
}

function selectText(includeBrack: boolean,inCludeWidget: boolean = false) {
    const searchContext = getSearchContext();//
    let { text, backwardStarter, forwardStarter } = searchContext;
    if (backwardStarter < 0 || forwardStarter >= text.length) {
        return;
    }

    let selectionStart: number, selectionEnd: number;
    var backwardResult = findBackward(searchContext.text, searchContext.backwardStarter);//后查
    var forwardResult = findForward(searchContext.text, searchContext.forwardStarter);//前查

    while (forwardResult != null // 当 后查有,且和前查 标记不同,且为引号 那么从尾位置继续往后找,直到和前查匹配
        && !isMatch(backwardResult, forwardResult)
        && bracketUtil.isQuoteBracket(forwardResult.bracket)) {
        forwardResult = findForward(searchContext.text, forwardResult.offset + 1); 
    }
    while (backwardResult != null //当前查有,且和后查 标记不同,且为引号,那么继续从头位置往前继续查,直到和后查匹配
        && !isMatch(backwardResult, forwardResult)
        && bracketUtil.isQuoteBracket(backwardResult.bracket)) {
        backwardResult = findBackward(searchContext.text, backwardResult.offset - 1);
    }

    if (!isMatch(backwardResult, forwardResult)) {
        showInfo('Unmatched bracket pair')
        return;
    }
    // we are next to a bracket
    // this is the case for doule press select
    if (backwardStarter == backwardResult.offset && forwardResult.offset == forwardStarter) {
        selectionStart = backwardStarter - 1;
        selectionEnd = forwardStarter + 1;
    } else {
        if (includeBrack) {
            selectionStart = backwardResult.offset - 1;//起点位置
            selectionEnd = forwardResult.offset + 1;
            if(inCludeWidget && backwardResult.bracket == '('){
                var regex = /(new )?\b_?[A-Z][a-zA-Z_]*\s*\($/g;
                var backwardBuffer = searchContext.text.substring(0,selectionStart+2);
                var forwoardBuffer = searchContext.text.substring(selectionEnd,selectionEnd+1);
                var widgetStart = backwardBuffer.search(regex)
                if(widgetStart>=0)
                    selectionStart = widgetStart -1;
                if(forwoardBuffer == ','){
                    selectionEnd +=1;
                }
            }
        } else {
            selectionStart = backwardResult.offset;
            selectionEnd = forwardResult.offset;
        }
    }
    doSelection(selectionStart, selectionEnd);
}


//This is the main extension point
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('flutter-code-select.select', function () {
            selectText(false);
        }),
        vscode.commands.registerCommand('flutter-code-select.select-include', function () {
            selectText(true);
        }),
        vscode.commands.registerCommand('flutter-code-select.widget-include', function () {
            selectText(true,true);
        })
    );
    //vscode.window.showInformationMessage('from wxh');
}

// this method is called when your extension is deactivated
export function deactivate() {
}