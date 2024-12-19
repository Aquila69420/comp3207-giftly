import React from 'react';
import TextInput from './components/TextInput';
import ImageInput from './components/ImageInput';
import DropdownSelection from './components/DropdownSelection';
import UserLoginRegister from './components/UserLoginRegister';

function Home() {
  return (
    <div>
      <header className="App-header">
        <p>Gifto</p>
        <TextInput/>
        <ImageInput/>
        <DropdownSelection/>
        <UserLoginRegister/>
      </header>
    </div>
  );
}

export default Home;
