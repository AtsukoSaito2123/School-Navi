import './App.css';
import PageWithButtons from './components/PageWithButtons';


function App() {
  return (
    <div className="App">
      <header>
        <h1>School & Navi</h1>
        <div className="parent">
          <p className='parent-icon'>保護者</p>
          <p className='parent-name'>保護者名前</p>
        </div>
      </header>
      <main>
        <p className='child-name'>〇ねん〇くみ お子様名前</p>
        <section className='news'>
          <h2>＊お知らせ＊</h2>
          <div>
            <p>4/17UP 全校共通</p>
          </div>
        </section>
        <PageWithButtons />
      </main>
    </div>
  );
}

export default App;
