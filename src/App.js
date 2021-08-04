import logo from './img/map.svg';
import './App.css';
import DocumentTitle from 'react-document-title'

function App() {
  return (
    <DocumentTitle title={"Country Chalkboard"}>
    <div className="App">
      <header className="App-header">
        <h1>Hello world</h1>
        <h3>This site is under construction!</h3>
        <img src={logo} className="App-logo" alt="logo" />
      </header>
    </div>
    </DocumentTitle>
  );
}

export default App;
