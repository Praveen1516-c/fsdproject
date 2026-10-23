
package com.portal;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

public class MongoDBConnection {

    public static void main(String[] args) {

        String uri = System.getenv("MONGODB_URI");

        if (uri == null || uri.isBlank()) {
            System.out.println("MONGODB_URI is not configured.");
            return;
        }

        try (MongoClient client = MongoClients.create(uri)) {
            MongoDatabase database =
                    client.getDatabase("career_portal_db");

            database.runCommand(new Document("ping", 1));

            System.out.println("MongoDB connected successfully!");
            System.out.println("Database: " + database.getName());

        } catch (Exception e) {
            System.out.println("Connection failed: " + e.getMessage());
        }
    }
}

