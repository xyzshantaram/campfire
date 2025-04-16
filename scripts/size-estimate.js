#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import esbuild from "esbuild";
import { fileURLToPath } from "url";
import process from "node:process";
import { mkdir } from "node:fs/promises";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Define the build file paths
const inPath = path.join(rootDir, "src/campfire.ts");
const outDir = path.join(rootDir, "scripts/output");

await mkdir(outDir, { recursive: true });
const outFile = "campfire.min.js";
const outPath = path.join(outDir, outFile);

// Ensure the dist directory exists
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Build with esbuild
async function buildAndMeasure() {
    console.log("Building with esbuild...");

    try {
        // Bundle and minify
        await esbuild.build({
            entryPoints: [inPath],
            bundle: true,
            minify: true,
            outfile: outPath,
            format: "esm",
            target: "es2020",
            sourcemap: false,
        });

        // Get the original minified size
        const minifiedSize = fs.statSync(outPath).size;

        // Compress with gzip
        execSync(`gzip -c -9 "${outPath}" > "${outPath}.gz"`);
        const gzipSize = fs.statSync(`${outPath}.gz`).size;

        // Compress with zstd
        try {
            execSync(`zstd -19 -c "${outPath}" > "${outPath}.zst"`);
            const zstdSize = fs.statSync(`${outPath}.zst`).size;

            // Print the results in a table format
            console.log("\n=== Bundle Size ===");
            console.log(
                `Minified: ${formatBytes(minifiedSize)} (${minifiedSize} bytes)`,
            );
            console.log(`Gzip:     ${formatBytes(gzipSize)} (${gzipSize} bytes)`);
            console.log(`Zstd:     ${formatBytes(zstdSize)} (${zstdSize} bytes)`);

            // Clean up compression artifacts
            fs.unlinkSync(`${outPath}.gz`);
            fs.unlinkSync(`${outPath}.zst`);
        } catch (_) {
            // If zstd is not available, just show gzip results
            console.log("\n=== Bundle Size ===");
            console.log(
                `Minified: ${formatBytes(minifiedSize)} (${minifiedSize} bytes)`,
            );
            console.log(`Gzip:     ${formatBytes(gzipSize)} (${gzipSize} bytes)`);
            console.log("Zstd:     Not available (zstd command not found)");

            // Clean up compression artifacts
            fs.unlinkSync(`${outPath}.gz`);
        }
    } catch (error) {
        console.error("Error building or measuring size:", error);
        process.exit(1);
    }
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

await buildAndMeasure();
