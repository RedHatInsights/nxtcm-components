import type { Meta, StoryObj } from '@storybook/react';
import { LoadingPanel } from './LoadingPanel';

const meta: Meta<typeof LoadingPanel<UserData | ApiResponse | ItemData[]>> = {
  title: 'Components/Dashboard/LoadingPanel',
  component: LoadingPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data types
type UserData = {
  id: number;
  name: string;
  email: string;
};

type ItemData = {
  id: number;
  name: string;
};

type ApiResponse = {
  status: string;
  message: string;
};

// Success story with user data
export const SuccessWithData: Story = {
  args: {
    callback: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      } as UserData;
    },
    children: ({ data, error }) => {
      if (data && !('id' in data)) {
        return <div>No data available</div>;
      }
      if (error) {
        return <div style={{ color: 'red' }}>Error: {error.message}</div>;
      }
      if (!data) {
        return <div>No data available</div>;
      }
      return (
        <div>
          <h3>User Profile</h3>
          <p>
            <strong>ID:</strong> {data?.id}
          </p>
          <p>
            <strong>Name:</strong> {data?.name}
          </p>
          <p>
            <strong>Email:</strong> {data?.email}
          </p>
        </div>
      );
    },
  },
};

// Error story
export const ErrorState: Story = {
  args: {
    callback: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      throw new Error('Failed to fetch user data');
    },
    children: ({ data, error }) => {
      if (error) {
        return (
          <div style={{ color: 'red', padding: '1rem' }}>
            <h3>Error occurred</h3>
            <p>{error.message}</p>
          </div>
        );
      }
      if (!data) {
        return <div>No data available</div>;
      }
      return <div>Data: {JSON.stringify(data)}</div>;
    },
  },
};

// Quick success (no delay)
export const QuickSuccess: Story = {
  args: {
    callback: async () => {
      return {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      } as UserData;
    },
    children: ({ data, error }) => {
      if (data && !('id' in data)) {
        return <div>Invalid data type</div>;
      }
      if (error) {
        return <div style={{ color: 'red' }}>Error: {error.message}</div>;
      }
      if (!data) {
        return <div>No data available</div>;
      }
      return (
        <div>
          <h3>User Profile</h3>
          <p>
            <strong>ID:</strong> {data.id}
          </p>
          <p>
            <strong>Name:</strong> {data.name}
          </p>
          <p>
            <strong>Email:</strong> {data.email}
          </p>
        </div>
      );
    },
  },
};

// With array data
export const WithArrayData: Story = {
  args: {
    callback: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];
    },
    children: ({ data, error }) => {
      if (data && !Array.isArray(data)) {
        return <div>Invalid data type</div>;
      }
      if (error) {
        return <div style={{ color: 'red' }}>Error: {error.message}</div>;
      }
      if (!data) {
        return <div>No data available</div>;
      }
      return (
        <div>
          <h3>Items List</h3>
          <ul>
            {data.map((item: { id: number; name: string }) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      );
    },
  },
};

// With API response type
export const WithApiResponse: Story = {
  args: {
    callback: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return {
        status: 'success',
        message: 'Data loaded successfully',
      } as ApiResponse;
    },
    children: ({ data, error }) => {
      if (data && !('status' in data)) {
        return <div>Invalid data type</div>;
      }
      if (error) {
        return <div style={{ color: 'red' }}>Error: {error.message}</div>;
      }
      if (!data) {
        return <div>No data available</div>;
      }
      return (
        <div>
          <p>
            <strong>Status:</strong> {data.status}
          </p>
          <p>
            <strong>Message:</strong> {data.message}
          </p>
        </div>
      );
    },
  },
};

// Long loading delay
export const LongLoading: Story = {
  args: {
    callback: async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return {
        id: 3,
        name: 'Slow Data',
        email: 'slow@example.com',
      } as UserData;
    },
    children: ({ data, error }) => {
      if (data && !('id' in data)) {
        return <div>Invalid data type</div>;
      }
      if (error) {
        return <div style={{ color: 'red' }}>Error: {error.message}</div>;
      }
      if (!data) {
        return <div>No data available</div>;
      }
      return (
        <div>
          <h3>User Profile</h3>
          <p>
            <strong>ID:</strong> {data.id}
          </p>
          <p>
            <strong>Name:</strong> {data.name}
          </p>
          <p>
            <strong>Email:</strong> {data.email}
          </p>
        </div>
      );
    },
  },
};
