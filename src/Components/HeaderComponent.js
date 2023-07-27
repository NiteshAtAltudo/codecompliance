import logo from './Image/CodeCompliance.PNG';

function HeaderComponent() {
  return (
    <nav>
      <a>
        <img src={logo} width="150" height="80" className="d-inline-block align-top" alt=""/>
      </a>
      <p/>
    </nav>
  );
}

export default HeaderComponent;
