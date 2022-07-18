import { useState, useCallback, useEffect, useRef, Fragment } from "react";
import consts from "./consts";
import { createRoot } from 'react-dom/client';
import styled, { createGlobalStyle, css } from 'styled-components'
import api from "./lib/api";
import { useStore } from "./store";
import toast, { Toaster } from "react-hot-toast";
import Webcam from "react-webcam";
import { QRCodeSVG } from 'qrcode.react';


const loadImage = async (dataUrl) => {

    return new Promise((resolve, reject) => {

        const image = new Image();
        image.src = dataUrl;

        image.addEventListener("load", () => {
            resolve(image);
        });

        image.addEventListener("error", reject);
    });

}

const dataURLtoBlob = (dataurl) => {

    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);


    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });

}

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    font-family: 'Montserrat', sans-serif;
    box-sizing: border-box;
    font-size: 14px;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    color: white;
    background-color: ${consts.BACKGROUND_COLOR};
  }
`
const QRContainer = styled.div`
    height: 100%;
    width: 100%;
    background-color: white;
    padding: 32px;
    margin-bottom: 16px;
    svg {
        height: 100%;
        width: 100%;
    }
`
const Container = styled.div`
    height: 100%;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 32px;
`;

const PreviewContainer = styled.div`
    text-align: center;
`

const Section = styled.div`
    margin-bottom: 16px;
`

const InputContainer = styled.div`
    margin-bottom: 16px;
    label {
        display: block;
        margin-bottom: 4px;
    }

    select,
    input {
        width: 100%;
        padding: 8px;
        border: none;
        border-radius: 4px;
    }
`;

const ButtonC = styled.button`
    background-color: ${consts.PRIMARY_BUTTON};
    color: white;
    border: 0;
    padding: 12px;
    width: 100%;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;

    :hover {
        background-color: #50566A;
    }

    ${props => props.isDisabled === true && css`
        opacity: 0.2;
        pointer-events: none;
    `}
`

const SecondaryButtonC = styled.button`
    background-color: ${consts.SECONDARY_BUTTON};
    color: white;
    border: 0;
    padding: 12px;
    width: 100%;
    border-radius: 4px;
    cursor: pointer;

    :hover {
        background-color: ${consts.SECONDARY_BUTTON_HOVER};
    }

    ${props => props.isDisabled === true && css`
        opacity: 0.2;
        pointer-events: none;
    `}
`

const SmallButton = styled.button`
    background-color: ${consts.PRIMARY_BUTTON};
    color: white;
    border: 0;
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;
    :hover {
        background-color: #50566A;
    }
`;

const Card = styled.div`
    width: 100%;
    padding: 16px;
    background-color: ${consts.CARD_BACKGROUND};
    border-radius: 8px;
    margin-bottom: 8px;
`;

const BigTitle = styled.div`
    font-size: 1.2em;
    margin-bottom: 8px;
    font-weight: bold;
`;


const Title = styled.div`
    font-size: 1.1em;
    margin-bottom: 4px;
    font-weight: bold;
`;

const DragContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  background-color: ${consts.BACKGROUND_COLOR};
  border-style: dashed;
  color: #bdbdbd;
  outline: none;
  transition: border .24s ease-in-out;
  margin-bottom: 8px;

  img {
      max-width: 100%;
  }
`;

const BackButtonS = styled.div`
    margin-top: 16px;
`

const Columnar = ({ columns, children }) => {
    return <div style={{ display: "grid", gridTemplateColumns: `${columns.join(" ")}` }}>
        {children}
    </div>
}

const Button = ({ children, onClick }) => {
    const buttonsDisabled = useStore(state => state.buttonsDisabled);
    return <ButtonC isDisabled={buttonsDisabled} onClick={!buttonsDisabled ? onClick : () => { }}>{children}</ButtonC>
}

const SecondaryButton = ({ children, onClick }) => {
    const buttonsDisabled = useStore(state => state.buttonsDisabled);
    return <SecondaryButtonC isDisabled={buttonsDisabled} onClick={!buttonsDisabled ? onClick : () => { }}>{children}</SecondaryButtonC>
}

const BackButton = ({ view }) => {
    const setView = useStore(state => state.setView);
    return <BackButtonS onClick={() => setView(view)}>Go Back</BackButtonS>

}

const Input = ({ label, value, onChange, type = "text", placeholder = "", disabled = false }) => {
    return <InputContainer>
        <label>{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onChange={({ target: { value } }) => onChange(value)}
        />
    </InputContainer>
}

const LoginView = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const setView = useStore(state => state.setView);

    const login = useCallback(async () => {
        const loggedIn = await api.login(username, password);

        if (loggedIn) {
            setView("contracts");
        }

    }, [username, password])

    return <section>
        <h1>Login</h1>
        <InputContainer>
            <label htmlFor="contract-name">Username</label>
            <input type="text"
                id="contract-name"
                value={username}
                onChange={({ target: { value } }) => setUsername(value)}
            />
        </InputContainer>
        <InputContainer>
            <label htmlFor="series-name">Password</label>
            <input
                type="password"
                id="series-name"
                value={password}
                onChange={({ target: { value } }) => setPassword(value)}
            />
        </InputContainer>
        <Button onClick={login}>Login</Button>
    </section>
}

const ContractsView = () => {

    const [contracts, setContracts] = useState([]);

    const setView = useStore(state => state.setView);
    const setContract = useStore(state => state.setContract);

    useEffect(() => {

        (async () => {
            const res = await api.get("/v2/contracts/?self=true");
            setContracts(res.results);
        })();

    }, []);

    const useContract = (contract) => {
        setContract(contract);
        setView("contract");
    }

    return <section>
        <h1>Contracts</h1>
        <Section>
            {contracts.map(c => {
                return <Card key={c.id}>
                    <Columnar columns={["4fr", "1fr"]}>
                        <div>
                            <Title>{c.name}</Title>
                        </div>
                        <div style={{ "textAlign": "right" }}>
                            <SecondaryButton onClick={() => useContract(c)}>Use</SecondaryButton>
                        </div>
                    </Columnar>
                </Card>
            })}
        </Section>
        <Button onClick={() => setView("createContract")}>Create Contract</Button>
    </section>

}

const ContractView = () => {

    const [series, setSeries] = useState([]);
    const contract = useStore(state => state.contract);
    const setView = useStore(state => state.setView);
    const setSeriesG = useStore(state => state.setSeries);

    useEffect(() => {

        (async () => {
            const res = await api.get(`/v2/series/?contract=${contract.address}`);
            setSeries(res.results);
        })();

    }, []);

    const useSeries = (series) => {
        setSeriesG(series);
        setView("mint");
    }

    return <section>
        <BigTitle>Series for {contract.name}</BigTitle>
        <Section>
            {series.map(s => {
                return <Card key={s.id}>
                    <Columnar columns={["4fr", "1fr"]}>
                        <div>
                            <Title>{s.name}</Title>
                        </div>
                        <div style={{ marginTop: "8px" }}>
                            <SecondaryButton onClick={() => useSeries(s)}>Use</SecondaryButton>
                        </div>
                    </Columnar>
                </Card>
            })}
            {series.length === 0 ? "No series found" : null}
        </Section>
        <Button onClick={() => setView("createSeries")}>Create Series</Button>
        <BackButton view={"contracts"} />
    </section>

}

const CreateContractView = () => {

    const [networks, setNetworks] = useState([]);
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [network, setNetwork] = useState("");
    const [privateKey, setPrivateKey] = useState("");

    useEffect(() => {

        (async () => {
            const res = await api.get("/v2/networks/");
            setNetworks(res.results);
        })();

    }, []);

    const createContract = useCallback(async () => {

        const reqBody = { network, name, symbol, private_key: privateKey };
        const res = await api.post("/v2/contracts/", reqBody)

    }, [network, symbol, name, privateKey]);

    return <div>
        <BigTitle>Create Contract</BigTitle>
        <Card>
            <InputContainer>
                <label>Name</label>
                <input
                    type="text"
                    placeholder="My Contract"
                    value={name}
                    onChange={({ target: { value } }) => setName(value)}
                />
            </InputContainer>
            <InputContainer>
                <label>Symbol</label>
                <input
                    type="text"
                    placeholder="MC"
                    value={symbol}
                    onChange={({ target: { value } }) => setSymbol(value)}
                />
            </InputContainer>
            <InputContainer>
                <label>Network</label>
                <select
                    value={network}
                    onChange={({ target: { value } }) => setNetwork(value)}
                >
                    {networks.map(n => {
                        return <option key={n.id} value={n.id}>
                            {n.name} ({n.network_id})
                        </option>
                    })}
                </select>
            </InputContainer>
            <InputContainer>
                <label>Private Key</label>
                <input
                    type="password"
                    value={privateKey}
                    onChange={({ target: { value } }) => setPrivateKey(value)}
                />
            </InputContainer>
            <Button onClick={createContract}>Create</Button>
        </Card>
        <BackButton view={"contracts"} />
    </div>

}

const CreateSeriesView = () => {

    const contract = useStore(state => state.contract);
    const setView = useStore(state => state.setView);

    const [name, setName] = useState("");
    const [privateKey, setPrivateKey] = useState("");

    const createSeries = useCallback(async () => {

        const reqBody = { name, contract: contract.id, private_key: privateKey };
        const res = await api.post("/v2/series/", reqBody)

    }, [name, privateKey]);

    return <div>
        <BigTitle>Create Series</BigTitle>
        <Card>
            <Input
                label="Name"
                value={name}
                onChange={setName} />
            <Input
                label="Private Key"
                value={privateKey}
                onChange={setPrivateKey}
                type="password"
            />
            <Input
                label="Contract"
                value={contract.address}
                onChange={() => { }} disabled={true} />
            <Button onClick={createSeries}>Create</Button>
        </Card>
        <BackButton onClick={() => setView("contract")} />
    </div>

}

const MintView = () => {

    const series = useStore(state => state.series)
    const [name, setName] = useState("");
    const [owner, setOwner] = useState("");
    const [image, setImage] = useState(null);
    const [imageBytes, setImageBytes] = useState(null);
    const [redeemCode, setRedeemCode] = useState(null);
    const [watermarkSrc, setWatermarkSrc] = useState(null);

    const watermarkRef = useRef(null);
    const webcamRef = useRef(null);
    const videoConstraints = {
        width: 600,
        height: 600,
    };

    const mint = useCallback(async () => {

        const form = new FormData();
        form.append("series", series.id);
        form.append("attributes[0]", 0);
        form.append("attributes[1]", 0);
        form.append("attributes[2]", 0);
        form.append("attributes[3]", 0);
        form.append("attributes[4]", 0);

        form.append("render", imageBytes, "render.png");

        const { code } = await api.upload("/v2/tokens/dispense/", form);
        setRedeemCode(code);

    }, [name, owner, imageBytes]);

    const capture = useCallback(async () => {

        const imageSrc = webcamRef.current.getScreenshot();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = "600";
        canvas.width = "600";

        const background = await loadImage(imageSrc);
        const watermark = await loadImage(watermarkSrc);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, 600, 600);
        ctx.drawImage(watermark, 0, 0, 150, 150);

        const b64 = canvas.toDataURL();
        setImage(b64);
        setImageBytes(dataURLtoBlob(b64));

    }, [webcamRef, watermarkSrc]);

    useEffect(() => {

        if (watermarkRef.current === null) {
            return;
        }

        watermarkRef.current.addEventListener("change", ({ target }) => {

            const reader = new FileReader();
            reader.addEventListener("load", ({ target: { result } }) => {
                setWatermarkSrc(result);
            });
            reader.readAsDataURL(target.files[0]);

        });

    }, [watermarkRef]);

    let content;
    if (redeemCode) {
        content = <Fragment>
            <QRContainer>
                <QRCodeSVG value={redeemCode} />
            </QRContainer>
            <Button onClick={async () => {
                setImage(null);
                setImageBytes(null);
                setRedeemCode(null);
            }}>Done</Button>
        </Fragment>
    } else {
        content = <Fragment>
            {!image && <Webcam
                width={600}
                height={600}
                ref={webcamRef}
                videoConstraints={videoConstraints}
                screenshotFormat="image/png"
                screenshotQuality={1}
                style={{ width: "100%", heigth: "100%" }}
                mirrored={true}
            />}
            {image && <PreviewContainer>
                <img src={image} />
            </PreviewContainer>
            }
            {!image ?
                <Button onClick={async () => {
                    await capture();
                }}>Take Picture</Button> :
                <Fragment>
                    <Button onClick={async () => {
                        await mint()
                    }}>Mint</Button>
                    <Button onClick={async () => {
                        setImage(null);
                        setImageBytes(null);
                        setRedeemCode(null);
                    }}>Retake</Button>
                </Fragment>
            }
        </Fragment>
    }
    return <div>
        <BigTitle>Mint an NFT on {series.name}</BigTitle>
        <Card>
            {content}
        </Card>
        <BackButton view="contract" />
        <input ref={watermarkRef} type="file" placeholder="Set" />
    </div>
}

const App = () => {

    const enableButtons = useStore(state => state.enableButtons);
    const view = useStore(state => state.view);
    let viewElement;

    switch (view) {
        case "login":
            viewElement = <LoginView />
            break;
        case "contracts":
            viewElement = <ContractsView />
            break;
        case "contract":
            viewElement = <ContractView />
            break;
        case "createContract":
            viewElement = <CreateContractView />
            break;
        case "createSeries":
            viewElement = <CreateSeriesView />
            break;
        case "mint":
            viewElement = <MintView />
            break;
    }

    useEffect(() => {
        enableButtons();
    }, []);

    return <>
        <GlobalStyle />
        <Toaster toastOptions={{
            style: {
                wordBreak: 'break-all'
            }
        }} />
        <Container>
            {viewElement}
        </Container>
    </>
}


const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />)

console.log("Starting NFT Selfies")