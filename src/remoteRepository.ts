import { Uri } from "vscode";
import { ISvnInfo, ISvnLogEntry } from "./common/types";
import { PathNormalizer } from "./pathNormalizer";
import { Svn } from "./svn";
import { Repository as BaseRepository } from "./svnRepository";

export interface IRemoteRepository {
  branchRoot: Uri;

  getPathNormalizer(): PathNormalizer;

  log(
    rfrom: string,
    rto: string,
    limit: number,
    target?: string | Uri
  ): Promise<ISvnLogEntry[]>;

  /**
   * Executes "svn cat" of the specified file. 
   * @param filePath of the file to be displayed
   * @param revision the revision of the file to be displayed
   * @param useRepoRevision when true, the revision will be used as repository revision, 
   *  required when filePath does not exist in current repository revision
   */
  show(filePath: string | Uri, revision?: string, useRepoRevision?: boolean): Promise<string>;
}

export class RemoteRepository implements IRemoteRepository {
  private info: ISvnInfo;
  private constructor(private repo: BaseRepository) {
    this.info = repo.info;
  }

  public static async open(svn: Svn, uri: Uri): Promise<RemoteRepository> {
    const repo = await svn.open(uri.toString(true), "");
    return new RemoteRepository(repo);
  }

  public getPathNormalizer(): PathNormalizer {
    return new PathNormalizer(this.info);
  }

  public get branchRoot(): Uri {
    return Uri.parse(this.info.url);
  }

  public async log(
    rfrom: string,
    rto: string,
    limit: number,
    target?: string | Uri
  ): Promise<ISvnLogEntry[]> {
    return this.repo.log(rfrom, rto, limit, target);
  }

  public async show(
    filePath: string | Uri,
    revision?: string,
    useRepoRevision?: boolean
  ): Promise<string> {
    return this.repo.show(filePath, revision, useRepoRevision);
  }
}
