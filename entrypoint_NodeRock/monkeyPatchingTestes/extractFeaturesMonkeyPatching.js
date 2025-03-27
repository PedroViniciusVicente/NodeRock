const fs = require('fs');


function extractedFeaturesMonkeyPatching() {
    // const data = fs.readFileSync('promise_logs/promises.json', 'utf-8');
    const data = fs.readFileSync('NodeRock_src/FoldersUsedDuringExecution/temporary_promises_logs/promises.json', 'utf-8');


    try {
        const promises = JSON.parse(data);
        
        // Filter only resolved and rejected promises with duration
        const settledPromises = promises.filter(p => p.status === 'resolved' || p.status === 'rejected');
        
        // Use Map to get unique promises (last occurrence for each promiseID)
        const uniqueSettled = new Map();
        settledPromises.forEach(p => uniqueSettled.set(p.promiseID, p));

        const settledArray = Array.from(uniqueSettled.values());
        const resolved = settledArray.filter(p => p.status === 'resolved');
        const rejected = settledArray.filter(p => p.status === 'rejected');

        // Calculate averages
        const avgResolved = resolved.length > 0 
            ? resolved.reduce((sum, p) => sum + p.durationMs, 0) / resolved.length 
            : 0;
        
        const avgRejected = rejected.length > 0 
            ? rejected.reduce((sum, p) => sum + p.durationMs, 0) / rejected.length 
            : 0;

        // Find maximum resolved duration
        const maxResolved = resolved.length > 0
            ? Math.max(...resolved.map(p => p.durationMs))
            : 0;

        // Calculate resolution percentage
        const totalSettled = settledArray.length;
        const resolutionPercentage = totalSettled > 0
            ? (resolved.length / totalSettled) * 100
            : 0;

        // console.log('Average duration:');
        // console.log(`- Resolved: ${avgResolved.toFixed(2)}ms`);
        // console.log(`- Rejected: ${avgRejected.toFixed(2)}ms`);
        // console.log(`Longest resolved promise: ${maxResolved}ms`);
        // console.log(`Resolved percentage: ${resolutionPercentage.toFixed(2)}%`);

        return {
            totalSettledPromises: totalSettled,
            avgResolved: avgResolved,
            avgRejected: avgRejected,
            longestResolved: maxResolved,
            resolvedPercentage: resolutionPercentage
        };

    } catch (err) {
        console.error('Error parsing JSON:', err);
    }
}

module.exports = { extractedFeaturesMonkeyPatching };