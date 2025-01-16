import { CapitalizeFirstLetters } from '../utils/utils'

function NavBar({buttonNames, onNavigation}) {
    var width = (((1 / buttonNames.length) * 100).toPrecision(2)).toString() + '%';
    
    const navigationButtons = buttonNames.map((buttonName, index) => (
        <button style={{width: width}} key={index} class='navbar-button' onClick={() =>{
            onNavigation(buttonName)
        }}>{ CapitalizeFirstLetters(buttonName) }</button>
    ));

    return (
        <div class='navbar-container'>
            {navigationButtons}
        </div>
    )
}

export default NavBar;