import { fromData, IIntegrity, parse } from 'ssri';
import { readFile } from './io';
import { bug } from './log';

export const getIntegrity = async (path: string): Promise<IIntegrity> => {
  try {
    const data = await readFile(path).toString();
    return fromData(data);
  } catch (err) {
    bug(`failed to get hash integrity of ${path} from zkat/ssri`, err);
    return parse('');
  }
};
