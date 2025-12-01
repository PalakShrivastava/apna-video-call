import '../App.css';
import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>Apna Video Call</h2>
                </div>
                <div className="navList">

                    <Link to="/auth">Register</Link>
                    <Link to="/auth">Login</Link>
                   
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1>
                        <span style={{ color: "#FF9839" }}>Connect </span>
                        with your loved Ones
                    </h1>
                    <p>Cover a distance by Apna Video Call</p>

                    <Link className="getStartedBtn" to="/auth">
                        Get Started
                    </Link>
                </div>

                <div>
                    <img src="/images/mobile.png" alt="App preview" />
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
