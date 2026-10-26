declare module 'bun:sqlite' {
  export class Database {
    constructor(filename?: string, options?: any);
    run(sql: string, ...params: any[]): { changes: number; lastInsertRowid: number | bigint };
    query(sql: string): {
      all(...params: any[]): any[];
      get(...params: any[]): any;
      run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
    };
    prepare(sql: string): {
      all(...params: any[]): any[];
      get(...params: any[]): any;
      run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
    };
    close(): void;
  }
}
