
import * as fs from "fs-extra";
import * as vscode from "vscode";
import * as path from "path";
import { ConstantString, EnvKeys, VSCodeCommands } from "./constants";
import * as globalVariables from "./globalVariables";

export function isSpeechResourceSeleted(): boolean {
  const workspaceFolder = globalVariables.workspaceUri?.fsPath;
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder is open.');
    return false;
  }

  const envFilePath = path.join(workspaceFolder, ConstantString.EnvFolderName, ConstantString.EnvFileName);
  if (!fs.existsSync(envFilePath)) {
    return false;
  }

  const envContent = fs.readFileSync(envFilePath, 'utf8');

  let speechServiceKey = extractEnvValue(envContent, EnvKeys.SpeechResourceKey);
  let serviceRegion = extractEnvValue(envContent, EnvKeys.ServiceRegion);
  let tenantId = extractEnvValue(envContent, EnvKeys.TenantId);
  let subscriptionId = extractEnvValue(envContent, EnvKeys.AzureSubscriptionId);

  if (!speechServiceKey || !serviceRegion || !tenantId || !subscriptionId) {
    return false;
  }

  return true;
}

// Helper function to extract env variables from content.
function extractEnvValue(content: string, key: string): string | undefined {
  const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1] : undefined;
}

// open document in editor's new coloumn. If already open, focus on it.
export async function openDocumentInNewColumn(filePath: string) {
  const envFileUri = vscode.Uri.file(filePath);
  const openEditor = vscode.window.visibleTextEditors.find(editor => editor.document.uri.fsPath === envFileUri.fsPath);

  if (openEditor) {
    await vscode.window.showTextDocument(openEditor.document, openEditor.viewColumn);
  } else {
    await vscode.commands.executeCommand(VSCodeCommands.OpenDocument, envFileUri, {
      viewColumn: vscode.ViewColumn.Beside
    });
  }
}