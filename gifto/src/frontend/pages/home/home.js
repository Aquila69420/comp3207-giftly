import React from 'react';
import TextInput from './components/TextInput';
import ImageInput from './components/ImageInput';
import DropdownSelection from './components/DropdownSelection';

function Home() {
  return (
    <div>
      <header className="App-header">
        <p>Gifto</p>
        <TextInput/>
        <ImageInput/>
        <DropdownSelection/>
      </header>
    </div>
  );
}

export default Home;
