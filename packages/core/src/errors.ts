export class TaelError extends Error {
  override name = 'TaelError';
}

export class WorkspaceExistsError extends TaelError {
  override name = 'WorkspaceExistsError';
  constructor(public readonly dir: string) {
    super(`A Tael workspace already exists at ${dir}`);
  }
}

export class WorkspaceNotFoundError extends TaelError {
  override name = 'WorkspaceNotFoundError';
  constructor(public readonly startDir: string) {
    super(`No Tael workspace found in ${startDir} or any parent. Run \`tael init\` first.`);
  }
}
