const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const db = require('./keys').mongoUri;

const typeDefs = require('./graphql/typedefs');
const resolvers = require('./graphql/resolvers/index');

const server = new ApolloServer({
	typeDefs,
	resolvers,
});
mongoose
	.connect(db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((res) =>
		console.log('MongoDb connected....')
	)
	.catch((err) => console.log(err));
server.listen({ port: 5000 }).then((res) => {
	console.log(`Server running at ${res.url}`);
});
