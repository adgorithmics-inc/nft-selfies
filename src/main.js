import { useState, useCallback, useEffect } from "react";
import consts from "./consts";
import { createRoot } from 'react-dom/client';
import styled, { createGlobalStyle, css } from 'styled-components'
import api from "./lib/api";
import { useStore } from "./store";
import { useDropzone } from 'react-dropzone'
import toast, { Toaster } from "react-hot-toast";

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

const Container = styled.div`
    height: 100%;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 32px;
`;

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
                            {c.address}
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
        console.log("Res =>", res);

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

    const onDrop = useCallback(acceptedFiles => {

        setImage(acceptedFiles[0]);
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('load', ({ target: { result } }) => {
            setImageBytes(result)
        });

    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/png': [] } })

    const mint = useCallback(async () => {

        const tokenReqBody = { series: series.id, attributes: [0, 0, 0, 0, 0] };
        const { code } = await api.put("/v2/tokens/dispense/", tokenReqBody)
        const { id } = await api.post("/v2/tokens/exchange/", { code, owner });
        const { status } = await api.get(`/v2/tokens/${id}/`);

        if (status === "error") {
            toast.error("Something went wrong minting but we don't know what. Double check your inputs or contact support.");
        }


        await api.put(`/v2/tokens/${id}/`, { name });
        await api.upload(`/v2/tokens/${id}/`, image);

    }, [name, owner, image]);

    return <div>
        <BigTitle>Mint an NFT on {series.name}</BigTitle>
        <Card>
            <Input
                label="Name"
                value={name}
                onChange={setName} />
            <Input
                label="Address"
                value={owner}
                onChange={setOwner} />

            {imageBytes === null ?
                <DragContainer {...getRootProps()}>
                    <input {...getInputProps()} />
                    {
                        isDragActive ?
                            <p>Drop an image file here ...</p> :
                            <p>Drop an image here.</p>
                    }
                </DragContainer> : <DragContainer><img src={imageBytes} /></DragContainer>}
            <Button onClick={mint}>Mint</Button>
        </Card>
        <BackButton view="contract" />
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