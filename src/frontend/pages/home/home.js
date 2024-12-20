import React, { useState } from 'react';
import TextInput from './components/TextInput';
import ImageInput from './components/ImageInput';
import DropdownSelection from './components/DropdownSelection';
import UserLoginRegister from './components/UserLoginRegister';

function Home() {
  const [username, setUsername] = useState('');
  return (
    <div>
      <header className="App-header">
        <p>Gifto</p>
        <TextInput username={username}/>
        <ImageInput username={username}/>
        <DropdownSelection username={username}/>
        <UserLoginRegister setUsername={setUsername}/>
      </header>
    </div>
  );
}

export default Home;
