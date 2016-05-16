package main

import (
    "errors"
    "fmt"
    "strconv"
    "encoding/json"
    "strings"

    "github.com/openblockchain/obc-peer/openchain/chaincode/shim"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

var termIndexStr = "_termindex"                //name for the key/value that will store a list of all known terms

type SearchTerm struct{
    Name string `json:"name"`
    Term string `json:"term"`
    Size int `json:"size"`
    User string `json:"user"`
}

// ============================================================================================================================
// Main
// ============================================================================================================================
func main() {
        err := shim.Start(new(SimpleChaincode))
        if err != nil {
                fmt.Printf("Error starting Simple chaincode: %s", err)
        }
}

// ============================================================================================================================
// Init - reset all the things
// ============================================================================================================================
func (t *SimpleChaincode) init(stub *shim.ChaincodeStub, args []string) ([]byte, error) {
    var Aval int
    var err error

    if len(args) != 1 {
        return nil, errors.New("Incorrect number of arguments. Expecting 1")
    }

    // Initialize the chaincode
    Aval, err = strconv.Atoi(args[0])
    if err != nil {
        return nil, errors.New("Expecting integer value for asset holding")
    }

    // Write the state to the ledger
    err = stub.PutState("abc", []byte(strconv.Itoa(Aval)))                //making a test var "abc", I find it handy to read/write to it right away to test the network
    if err != nil {
        return nil, err
    }
    
    var empty []string
    jsonAsBytes, _ := json.Marshal(empty)                                //marshal an emtpy array of strings to clear the index
    err = stub.PutState(termIndexStr, jsonAsBytes)
    if err != nil {
        return nil, err
    }

    fmt.Printf(" ############ KIRK ############# chaincode init")
    
    return nil, nil
}

// ============================================================================================================================
// Run - Our entry point
// ============================================================================================================================
func (t *SimpleChaincode) Run(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
    fmt.Printf(" ############ KIRK ############# chaincode run")    
    fmt.Println("run is running " + function)

    // Handle different functions
    if function == "init" {                                                    //initialize the chaincode state, used as reset
        return t.init(stub, args)
    } else if function == "delete" {                                        //deletes an entity from its state
        return t.Delete(stub, args)
    } else if function == "write" {                                            //writes a value to the chaincode state
        return t.Write(stub, args)
    } else if function == "init_term" {                                    //create a new search term
        return t.init_term(stub, args)
    } else if function == "set_user" {                                        //change owner of a search term
        return t.set_user(stub, args)
    }
    fmt.Println("run did not find func: " + function)                        //error

    return nil, errors.New("Received unknown function invocation")
}

// ============================================================================================================================
// Query - Our entry point for Queries
// ============================================================================================================================
func (t *SimpleChaincode) Query(stub *shim.ChaincodeStub, function string, args []string) ([]byte, error) {
    fmt.Printf(" ############ KIRK ############# chaincode query")
        fmt.Println("query is running " + function)

        // Handle different functions
        if function == "read" {                                                                                                 //read a variable
                return t.read(stub, args)
        }
        fmt.Println("query did not find func: " + function)                                             //error

        return nil, errors.New("Received unknown function query")
}

// ============================================================================================================================
// Delete - remove a key/value pair from state
// ============================================================================================================================
func (t *SimpleChaincode) Delete(stub *shim.ChaincodeStub, args []string) ([]byte, error) {
    if len(args) != 1 {
        return nil, errors.New("Incorrect number of arguments. Expecting 1")
    }
    
    name := args[0]
    err := stub.DelState(name)                                                    //remove the key from chaincode state
    if err != nil {
        return nil, errors.New("Failed to delete state")
    }

    //get the term index
    termAsBytes, err := stub.GetState(termIndexStr)
    if err != nil {
        return nil, errors.New("Failed to get term index")
    }
    var termIndex []string
    json.Unmarshal(termAsBytes, &termIndex)                                //un stringify it aka JSON.parse()
    
    //remove term from index
    for i,val := range termIndex{
        fmt.Println(strconv.Itoa(i) + " - looking at " + val + " for " + name)
        if val == name{                                                            //find the correct term
            fmt.Println("found term")
            termIndex = append(termIndex[:i], termIndex[i+1:]...)            //remove it
            for x:= range termIndex{                                            //debug prints...
                fmt.Println(string(x) + " - " + termIndex[x])
            }
            break
        }
    }
    jsonAsBytes, _ := json.Marshal(termIndex)                                    //save new index
    err = stub.PutState(termIndexStr, jsonAsBytes)
    return nil, nil
}

// ============================================================================================================================
// Write - write variable into chaincode state
// ============================================================================================================================
func (t *SimpleChaincode) Write(stub *shim.ChaincodeStub, args []string) ([]byte, error) {
    var name, value string // Entities
    var err error
    fmt.Println("running write()")

    if len(args) != 2 {
        return nil, errors.New("Incorrect number of arguments. Expecting 2. name of the variable and value to set")
    }

    name = args[0]                                                            //rename for funsies
    value = args[1]
    err = stub.PutState(name, []byte(value))                                //write the variable into the chaincode state
    if err != nil {
        return nil, err
    }
    return nil, nil
}

// ============================================================================================================================
// Init Term - create a new term, store into chaincode state
// ============================================================================================================================
func (t *SimpleChaincode) init_term(stub *shim.ChaincodeStub, args []string) ([]byte, error) {
    var err error

    //   0       1       2   3
    // "abcd",  mongo", "5", "bob"
    if len(args) != 3 {
        return nil, errors.New("Incorrect number of arguments. Expecting 4")
    }

    fmt.Println("- start init term")
    if len(args[0]) <= 0 {
        return nil, errors.New("1st argument must be a non-empty string")
    }
    if len(args[1]) <= 0 {
        return nil, errors.New("2nd argument must be a non-empty string")
    }
    if len(args[2]) <= 0 {
        return nil, errors.New("3rd argument must be a non-empty string")
    }
    if len(args[3]) <= 0 {
        return nil, errors.New("3rd argument must be a non-empty string")
    }

    size, err := strconv.Atoi(args[2])
    if err != nil {
        return nil, errors.New("3rd argument must be a numeric string")
    }
    
    term := strings.ToLower(args[1])
    user := strings.ToLower(args[3])

    str := `{"name": "` + args[0] + `", "term": "` + term + `", "size": ` + strconv.Itoa(size) + `, "user": "` + user + `"}`
    err = stub.PutState(args[0], []byte(str))                                //store term with id as key
    if err != nil {
        return nil, err
    }
        
    //get the term index
    termAsBytes, err := stub.GetState(termIndexStr)
    if err != nil {
        return nil, errors.New("Failed to get term index")
    }
    var termIndex []string
    json.Unmarshal(termAsBytes, &termIndex)                            //un stringify it aka JSON.parse()
    
    //append
    termIndex = append(termIndex, args[0])                                //add term name to index list
    fmt.Println("! term index: ", termIndex)
    jsonAsBytes, _ := json.Marshal(termIndex)
    err = stub.PutState(termIndexStr, jsonAsBytes)                        //store name of term

    fmt.Println("- end init term")
    return nil, nil
}

// ============================================================================================================================
// Set User Permission on Term
// ============================================================================================================================
func (t *SimpleChaincode) set_user(stub *shim.ChaincodeStub, args []string) ([]byte, error) {
    var err error
    
    //   0       1
    // "name", "bob"
    if len(args) < 2 {
        return nil, errors.New("Incorrect number of arguments. Expecting 2")
    }
    
    fmt.Println("- start set user")
    fmt.Println(args[0] + " - " + args[1])
    termAsBytes, err := stub.GetState(args[0])
    if err != nil {
        return nil, errors.New("Failed to get thing")
    }
    res := SearchTerm{}
    json.Unmarshal(termAsBytes, &res)                                        //un stringify it aka JSON.parse()
    res.User = args[1]                                                        //change the user
    
    jsonAsBytes, _ := json.Marshal(res)
    err = stub.PutState(args[0], jsonAsBytes)                                //rewrite the term with id as key
    if err != nil {
        return nil, err
    }
    
    fmt.Println("- end set user")
    return nil, nil
}
