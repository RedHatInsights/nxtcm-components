import '@testing-library/jest-dom';

// Polyfill for Web Streams API (TransformStream, ReadableStream, WritableStream)
// These are not available in jsdom by default but are needed by some dependencies
import { TransformStream, ReadableStream, WritableStream } from 'node:stream/web';

global.TransformStream = TransformStream;
global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
