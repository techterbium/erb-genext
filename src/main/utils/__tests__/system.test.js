import { routeEngine } from '../electrea';

describe('Route Engine', () => {
  const systemID = 'abcdefgh';
  test('No license present with internet', async () => {
    const actual = await routeEngine(true, null, systemID, false);
    expect(actual).toBeTruthy();
    expect(actual.route).toBe('licenses');
  });

  test('No license present with out internet', () => {
    routeEngine(false, null, systemID, false).then((actual) => {
      expect(actual).toBeTruthy();
      expect(actual.route).toBe('error');
    });
  });

  test('License present but no valid ones', () => {
    routeEngine(false, [], systemID, false).then((actual) => {
      expect(actual).toBeTruthy();
      expect(actual.route).toBe('error');
    });
  });

  test('Valid License, Due for validation with internet', async () => {
    const actual = await routeEngine(true, [{ systemID }], systemID, true);
    expect(actual).toBeTruthy();
    expect(actual.route).toBe('licenses');
  });

  test('License present and due for validation and no internet', async () => {
    const actual = await routeEngine(false, [{ systemID }], systemID, true);
    expect(actual).toBeTruthy();
    expect(actual.route).toBe('error');
  });

  test('Invalid license present and due for validation and with internet', async () => {
    const actual = await routeEngine(
      true,
      [{ systemID: 'abcdd' }],
      systemID,
      false
    );
    expect(actual).toBeTruthy();
    expect(actual.route).toBe('licenses');
  });
});
