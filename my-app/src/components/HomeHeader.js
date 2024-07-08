import '../css/HomeHeader.css';
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import Account from './Account';

const HomeHeader = ({ isAuth }) => {

    return (
        <header>
            <div className='wrapper'>
                <h1>
                    <Link to="/School-Navi/">
                        School & Navi
                    </Link>
                </h1>
                <nav>
                    {!isAuth ? (
                        <Link to="/School-Navi/userlogin">
                            <FontAwesomeIcon icon={faRightToBracket} />
                            ログイン
                        </Link>
                    ) : (
                        <Link to="/School-Navi/logout">
                            <FontAwesomeIcon icon={faRightToBracket} />
                            ログアウト
                        </Link>
                    )}
                </nav>
            </div>
            <Account />
        </header>
    )
}

export default HomeHeader
