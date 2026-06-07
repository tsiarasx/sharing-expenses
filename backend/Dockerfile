# Χρησιμοποιούμε μια ελαφριά έκδοση του Node.js (Alpine)
FROM node:20-alpine

# Ορίζουμε τον φάκελο εργασίας μέσα στο container
WORKDIR /app

# Αντιγράφουμε τα αρχεία package.json και package-lock.json πρώτα 
# (βοηθάει στο να γίνεται πιο γρήγορα το build)
COPY package*.json ./

# Εγκαθιστούμε τα dependencies
RUN npm install

# Αντιγράφουμε όλο τον υπόλοιπο κώδικα του backend
COPY . .

# Ανοίγουμε την πόρτα 5000 (που χρησιμοποιείς στο .env)
EXPOSE 5000

# Η εντολή για να ξεκινήσει ο server σου
CMD ["npm", "start"]