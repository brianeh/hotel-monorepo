FROM node:20-alpine

# Set working directory
WORKDIR /workspaces/hotel-monorepo/hotel-ui-react

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose Vite dev server port
EXPOSE 5173

# Default command: run Vite dev server
CMD ["npm", "run", "dev"]

