import { useEffect, useState } from 'react';

const Licenses = () => {
  const [licenses, setLicenses] = useState([]);
  const [user, setUser] = useState(null);
  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('license-page', []);

    window.electron.ipcRenderer.once('license-page-response', (resp) => {
      console.log(resp);
      const { user, licenses } = resp;
      setUser(user);
      setLicenses(licenses);
    });
  }, []);

  const bindHandler = (lic: any) => {
    window.electron.ipcRenderer.sendMessage('bind-license', [lic, user]);
  };

  return (
    <div>
      {licenses.map((lic) => {
        return (
          <div key={lic.id}>
            <span>{lic.id}</span>
            <span>{lic.state}</span>
            <span>{lic.status}</span>
            <button
              onClick={async () => {
                await bindHandler(lic);
              }}
            >
              Register
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Licenses;
