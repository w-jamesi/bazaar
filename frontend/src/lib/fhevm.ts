import { getAddress, hexlify, AbiCoder, zeroPadValue } from 'ethers';

let fheInstance: any = null;

/**
 * Initialize FHE instance using Zama's latest SDK
 */
export const initializeFHEVM = async (): Promise<any> => {
  if (fheInstance) {
    console.log('[FHE] Instance already initialized');
    return fheInstance;
  }

  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask.');
  }

  try {
    console.log('[FHE] Loading SDK from CDN 0.2.0...');
    const sdk: any = await import(
      'https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js'
    );
    const { initSDK, createInstance, SepoliaConfig } = sdk;
    
    console.log('[FHE] Initializing WASM...');
    await initSDK();
    
    const config = {
      ...SepoliaConfig,
      network: window.ethereum
    };
    
    console.log('[FHE] Creating instance...');
    fheInstance = await createInstance(config);
    console.log('[FHE] ✅ Instance initialized successfully');
    
    return fheInstance;
  } catch (error) {
    console.error('[FHE] ❌ Initialization failed:', error);
    throw new Error(`FHE initialization failed: ${error}`);
  }
};

/**
 * Get the current FHE instance
 */
export const getFHEVMInstance = (): any => {
  return fheInstance;
};

/**
 * Reset FHE instance (for testing/network switching)
 */
export const resetFheInstance = (): void => {
  fheInstance = null;
  console.log('[FHE] Instance reset');
};

/**
 * Encrypt a uint64 value using FHE
 */
export const encryptUint64 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ data: string; signature: string }> => {
  let fhe = getFHEVMInstance();
  if (!fhe) {
    fhe = await initializeFHEVM();
  }
  if (!fhe) throw new Error('Failed to initialize FHE instance');

  const contractAddressChecksum = getAddress(contractAddress);
  console.log('[FHE] Creating encrypted input for uint64...');
  
  const ciphertext = await fhe.createEncryptedInput(
    contractAddressChecksum,
    userAddress
  );
  ciphertext.add64(BigInt(value));
  
  console.log('[FHE] Encrypting uint64 value...');
  const { handles, inputProof } = await ciphertext.encrypt();
  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);
  
  console.log('[FHE] ✅ uint64 encryption successful');
  return { data: handle, signature: proof };
};

/**
 * Encrypt a uint32 value using FHE
 */
export const encryptUint32 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ data: string; signature: string }> => {
  let fhe = getFHEVMInstance();
  if (!fhe) {
    fhe = await initializeFHEVM();
  }
  if (!fhe) throw new Error('Failed to initialize FHE instance');

  const contractAddressChecksum = getAddress(contractAddress);
  console.log('[FHE] Creating encrypted input for uint32...');
  
  const ciphertext = await fhe.createEncryptedInput(
    contractAddressChecksum,
    userAddress
  );
  ciphertext.add32(value);
  
  console.log('[FHE] Encrypting uint32 value...');
  const { handles, inputProof } = await ciphertext.encrypt();
  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);
  
  console.log('[FHE] ✅ uint32 encryption successful');
  return { data: handle, signature: proof };
};

/**
 * Encrypt a uint16 value using FHE
 */
export const encryptUint16 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ data: string; signature: string }> => {
  let fhe = getFHEVMInstance();
  if (!fhe) {
    fhe = await initializeFHEVM();
  }
  if (!fhe) throw new Error('Failed to initialize FHE instance');

  const contractAddressChecksum = getAddress(contractAddress);
  console.log('[FHE] Creating encrypted input for uint16...');
  
  const ciphertext = await fhe.createEncryptedInput(
    contractAddressChecksum,
    userAddress
  );
  ciphertext.add16(value);
  
  console.log('[FHE] Encrypting uint16 value...');
  const { handles, inputProof } = await ciphertext.encrypt();
  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);
  
  console.log('[FHE] ✅ uint16 encryption successful');
  return { data: handle, signature: proof };
};

/**
 * Encrypt a uint8 value using FHE
 */
export const encryptUint8 = async (
  value: number,
  contractAddress: string,
  userAddress: string
): Promise<{ data: string; signature: string }> => {
  let fhe = getFHEVMInstance();
  if (!fhe) {
    fhe = await initializeFHEVM();
  }
  if (!fhe) throw new Error('Failed to initialize FHE instance');

  const contractAddressChecksum = getAddress(contractAddress);
  console.log('[FHE] Creating encrypted input for uint8...');
  
  const ciphertext = await fhe.createEncryptedInput(
    contractAddressChecksum,
    userAddress
  );
  ciphertext.add8(value);
  
  console.log('[FHE] Encrypting uint8 value...');
  const { handles, inputProof } = await ciphertext.encrypt();
  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);
  
  console.log('[FHE] ✅ uint8 encryption successful');
  return { data: handle, signature: proof };
};

/**
 * Request decryption of an encrypted value
 */
export const requestDecryption = async (
  contractAddress: string,
  handle: string
): Promise<number> => {
  const fhe = getFHEVMInstance();
  if (!fhe) throw new Error('FHE not initialized');
  
  try {
    console.log('[FHE] Requesting decryption...');
    const values = await fhe.publicDecrypt([handle]);
    const decryptedValue = Number(values[handle]);
    console.log('[FHE] ✅ Decryption successful');
    return decryptedValue;
  } catch (error: any) {
    console.error('[FHE] ❌ Decryption failed:', error);
    if (error?.message?.includes('Failed to fetch')) {
      throw new Error('Decryption service temporarily unavailable');
    }
    if (error?.message?.includes('not authorized')) {
      throw new Error('You do not have permission to decrypt this data');
    }
    throw error;
  }
};

/**
 * Helper to convert encrypted data to contract input format
 * The new SDK returns handles as bytes, not bytes32
 */
export const toContractInput = (encrypted: string): string => {
  // Return the encrypted handle as-is (it's already a proper hex string)
  console.log('[FHE] toContractInput:', encrypted.substring(0, 20) + '...');
  return encrypted;
};

/**
 * Helper to generate proof bytes for contract
 */
export const toProofBytes = (signature: string): string => {
  console.log('[FHE] toProofBytes length:', signature.length);
  return signature;
};

/**
 * Check if FHE is initialized
 */
export const isFheInitialized = (): boolean => {
  return fheInstance !== null;
};
