declare module 'react-native-ftp' {
    export default class FTP {
        static setup(host: string, port: number): void;
        static login(username: string, password: string): Promise<boolean>;
        static list(path: string): Promise<any[]>;
        static downloadFile(remotePath: string, localPath: string): Promise<string>;
    }
}
