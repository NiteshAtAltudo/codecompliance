import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

function  GetDataFromAzureDevOps({props}) {

    const organisationName = props.organisationName;
    const projectName = props.projectName;
    const repositoryId = props.repositoryId;
    const baseUrl = "https://dev.azure.com/";
    const pullRequestEndpoint = "/pullrequests?searchCriteria.status=completed&api-version=7.0";
    const commentEndpoint = "/threads?api-version=7.0";
    const iteractionEndpoint = "/iterations?api-version=7.0";
    const repositoryEndpoint = "/_apis/git/repositories/";
    const fileChangesEndpoint = "/changes?api-version=7.0";
    var prWithoutCommentVal = 0;
    var allNewLines = 0;
    const versionEndpoint = "/?api-version=7.0";
    const commitChangesEndpoint = "/changes?api-version=7.0";
    const endpintForChangesBetweenCommits = baseUrl + organisationName + "/_apis/Contribution/HierarchyQuery/project/" + projectName + "?api-version=7.1-preview";
    const [pullRequestsObject, setPullRequestsObject] = useState({ count: 0, value: [] });
    const [prWithoutComment, setPrWithoutComment] = useState(0);
    const [isThisPrWithoutComment, setIsThisPrWithoutComment] = useState("false");
    const [totalLineChangedInPrWithoutComment, setTotalLineChangedInPrWithoutComment] = useState(0);
    const [totalLineChangedInPrWithComment, setTotalLineChangedInPrWithComment] = useState(0);
    const [complainceReport, setComplainceReport] = useState(0);
    var totalLineChangedWithoutCommentPR = 0;
    var totalLineChangedWithCommentPR = 0;
    const apiUrlBase = baseUrl + organisationName + "/" + projectName + repositoryEndpoint + repositoryId;
    const pullRequestsURL = apiUrlBase + pullRequestEndpoint;
    const headers = {
        Authorization:
            "Basic "+props.tokenAccessInBase64,
        ContentType: "application/json",
    };
    const commitEndpoint = "/commits?api-version=7";
    var LineChangeForEachFile = 0;
    var prWithoutCommentState = false;

    useEffect(
        function () {

            const getAllPullRequest = async () => {
                await axios.get(pullRequestsURL, { headers }).then(function (response) {
                    if (response.status == 200) {
                        var allPrs = response.data;
                        if (allPrs.count > 0) {
                            setPullRequestsObject({ ...pullRequestsObject, value: allPrs.value, count: allPrs.count, });
                        }
                    }
                });
            };

            getAllPullRequest();
        },
        [pullRequestsObject.count]
    );
    useEffect(
        function () {
            const getCommentForEachPr = async (commentURL) => {
                try {
                    var comment = 0;
                    await axios.get(commentURL, { headers }).then(function (response) {
                        if (response.status == 200) {
                            var threads = response.data.value;
                            for (var threadObj of threads) {
                                var allComments = threadObj.comments;
                                if (!threadObj.isDeleted) {
                                    for (var commentObject of allComments) {
                                        if (commentObject.commentType == "text") {
                                            comment = comment + 1;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    if (comment == 0) {
                        prWithoutCommentVal = prWithoutCommentVal + 1;
                        setPrWithoutComment(prWithoutCommentVal);
                        return true;
                    } else {
                        return false;
                    }
                } catch (error) {
                    console.log(error)
                }

            };
            const getLineChangesInEachFile = async (dataProviders) => {
                try {
                    if (dataProviders["ms.vss-code-web.file-diff-data-provider"] != null) {
                        var dataAboutEachFile = dataProviders["ms.vss-code-web.file-diff-data-provider"].blocks;
                        for (var eachLineChange of dataAboutEachFile) {
                            if (eachLineChange.changeType == 1 || eachLineChange.changeType == 3) {
                                LineChangeForEachFile = LineChangeForEachFile + eachLineChange.mLinesCount;
                            }
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            };
            const getChangesInEachFile = async (eachParent, commitId, path) => {
                try {
                    const requestBodyForChanges = {
                        contributionIds: ["ms.vss-code-web.file-diff-data-provider"],
                        dataProviderContext: {
                            properties: {
                                repositoryId: repositoryId,
                                diffParameters: {
                                    includeCharDiffs: true,
                                    modifiedPath: path,
                                    modifiedVersion: "GC" + commitId,
                                    originalPath: path,
                                    originalVersion: "GC" + eachParent,
                                    partialDiff: true,
                                },
                            },
                        },
                    };
                    const requestBodyForChangesWithoutParent = {
                        contributionIds: ["ms.vss-code-web.file-diff-data-provider"],
                        dataProviderContext: {
                            properties: {
                                repositoryId: repositoryId,
                                diffParameters: {
                                    includeCharDiffs: true,
                                    modifiedPath: path,
                                    modifiedVersion: "GC" + commitId,
                                    originalPath: "",
                                    originalVersion: "GC" + eachParent,
                                    partialDiff: true,
                                },
                            },
                        },
                    };

                    let responseCommitChanges = await axios.post(endpintForChangesBetweenCommits, requestBodyForChanges, { headers, });
                    if (responseCommitChanges.status == 200) {
                        if (responseCommitChanges.data.dataProviderExceptions == null) {
                            await getLineChangesInEachFile(responseCommitChanges.data.dataProviders);
                        } else {
                            let responseCommitChangesWithoutParent = await axios.post(endpintForChangesBetweenCommits, requestBodyForChangesWithoutParent, { headers, });
                            if (responseCommitChangesWithoutParent.status == 200) {
                                await getLineChangesInEachFile(responseCommitChangesWithoutParent.data.dataProviders);
                            }
                        }

                    }
                } catch (error) {
                    console.log("error" + error);
                }
            };
            const getCommitDetailsOfThisCommit = async (parentsOfThisCommit, commitId) => {
                try {
                    var getCommitDetailsOfThisCommitUrl = apiUrlBase + "/commits/" + commitId + commitChangesEndpoint;
                    let responseCommitDetail = await axios.get(getCommitDetailsOfThisCommitUrl, { headers, });
                    if (responseCommitDetail.status == 200) {
                        var fileChangesInThisCommit = responseCommitDetail.data.changes;
                        for (var eachFile of fileChangesInThisCommit) {
                            if (eachFile.item.gitObjectType == "blob") {
                                for (var eachParent of parentsOfThisCommit) {
                                    await getChangesInEachFile(eachParent, commitId, eachFile.item.path);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.log("error" + error);
                }
            };

            const getParentCommitIdForEachCommit = async (commitId) => {

                try {
                    var parentsOfThisCommit;
                    var getParentsDetailsOfACommit = apiUrlBase + "/commits/" + commitId + versionEndpoint;
                    let totalNumberOfNewLineAddedInEachPr = 0;
                    let response = await axios.get(getParentsDetailsOfACommit, { headers, });
                    if (response.status == 200) {
                        parentsOfThisCommit = response.data.parents;
                        await getCommitDetailsOfThisCommit(parentsOfThisCommit, commitId);
                    }
                } catch (error) {

                }

            };

            const getAllCommitsForEachPR = async (commitForEachPrURL) => {
                try {
                    LineChangeForEachFile = 0;
                    let response = await axios.get(commitForEachPrURL, { headers });
                    if (response.status == 200) {
                        var commitCountPerPr = response.data.count;
                        if (commitCountPerPr > 0) {
                            var commitObjects = response.data.value;
                            for (var commitObject of commitObjects) {
                                await getParentCommitIdForEachCommit(commitObject.commitId);
                            }
                            if (prWithoutCommentState) {
                                totalLineChangedWithoutCommentPR = totalLineChangedWithoutCommentPR + LineChangeForEachFile;
                                console.log(prWithoutCommentState + "hi true" + totalLineChangedWithoutCommentPR);
                            } else {
                                totalLineChangedWithCommentPR = totalLineChangedWithCommentPR + LineChangeForEachFile;
                                console.log(prWithoutCommentState + "hi False" + totalLineChangedWithCommentPR);
                            }
                        }
                    }

                } catch (error) {
                    console.log(error)
                }

            };
            var allPullRequestsWithoutCommnent = async (count) => {
                try {
                    for (var prItem of pullRequestsObject.value) {
                        var commentURL = apiUrlBase + "/pullRequests/" + prItem.pullRequestId + commentEndpoint;
                        prWithoutCommentState = await getCommentForEachPr(commentURL);
                        console.log(prWithoutCommentState);
                        if (prWithoutCommentState) {
                            var commitForEachPrURL = apiUrlBase + "/pullRequests/" + prItem.pullRequestId + commitEndpoint;
                            await getAllCommitsForEachPR(commitForEachPrURL);
                        } else {
                            var commitForEachPrURL = apiUrlBase + "/pullRequests/" + prItem.pullRequestId + commitEndpoint;
                            await getAllCommitsForEachPR(commitForEachPrURL);
                        }
                    }
                    setTotalLineChangedInPrWithoutComment(totalLineChangedWithoutCommentPR);
                    setTotalLineChangedInPrWithComment(totalLineChangedWithCommentPR);
                } catch (error) {
                    console.log(error);
                }


            };

            if (pullRequestsObject.count > 0) {
                allPullRequestsWithoutCommnent(pullRequestsObject.count);
            }
        },
        [pullRequestsObject.count]
    );
    useEffect(function () {
        const getComplaineReportForThisProject = () => {
            try {
                let totalNumberOfPrs = pullRequestsObject.count;
                let totalNumberofModifiedLinesinAllPrs = totalLineChangedInPrWithComment + totalLineChangedInPrWithoutComment;
                let totalNumberofModifiedLineWithoutAnyComment = totalLineChangedInPrWithoutComment;
                let complianceOfThisProject = (totalLineChangedInPrWithComment / totalNumberofModifiedLinesinAllPrs) * 100;
                complianceOfThisProject = complianceOfThisProject.toFixed(2);
                setComplainceReport(complianceOfThisProject);

            } catch (error) {
                console.log(error);
            }

        }
        getComplaineReportForThisProject();
    }, [totalLineChangedInPrWithoutComment, totalLineChangedInPrWithComment])

    //Accordian Logic
    const defaultItem = 'item1';
    const [activeItem, setActiveItem] = useState(props.defaultAccordianItem);

    const handleItemClick = (item) => {
        setActiveItem(item === activeItem ? '' : item);
    };

    return (
        <>
            <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                    <button
                        className={`accordion-button ${activeItem === defaultItem ? '' : 'collapsed'}`}
                        type="button"
                        onClick={() => handleItemClick(defaultItem)}
                        aria-expanded={activeItem === defaultItem}
                        aria-controls="collapseOne"
                    >
                        {props.parentProject}
                    </button>
                </h2>
                <div
                    id="collapseOne"
                    className={`accordion-collapse collapse ${activeItem === defaultItem ? 'show' : ''}`}
                    aria-labelledby="headingOne"
                    data-bs-parent="#accordionExample"
                >
                    <div className="accordion-body">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Total PRs</th>
                                    <th>Number of Modified Lines in All PRs</th> 
                                    <th>Non Complaint PRs</th>
                                    <th>Number of Modified Lines in Non Complaint PRs</th>
                                    <th>Compliance %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Add your content here for Accordion Item #2 */}
                                <tr>
                                    <td>{pullRequestsObject.count}</td>
                                    <td>{totalLineChangedInPrWithoutComment+totalLineChangedInPrWithComment}</td>
                                    <td>{prWithoutComment}</td>
                                    <td>{totalLineChangedInPrWithoutComment}</td>
                                    <td>{complainceReport}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </>
    );
}

export default GetDataFromAzureDevOps;
