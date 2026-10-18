// Windows hosts can report ENOMEM from os.userInfo() even when memory is available.
// tsx only needs the username to name its local pipe. Leave normal hosts untouched.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const os = require('node:os');
const originalUserInfo = os.userInfo;

os.userInfo = function userInfoWithFallback(...args) {
  try {
    return originalUserInfo.apply(os, args);
  } catch (error) {
    if (process.platform !== 'win32' || error?.code !== 'ERR_SYSTEM_ERROR') {
      throw error;
    }
    return {
      username: process.env.USERNAME || 'windows-user',
      uid: -1,
      gid: -1,
      shell: null,
      homedir: os.homedir(),
    };
  }
};
