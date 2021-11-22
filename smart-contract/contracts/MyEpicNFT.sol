// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import {Base64} from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 private _totalSupply;

    string baseSvg =
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    string[] firstWords = [
        "Agreeable",
        "Obnoxious",
        "Spiffy",
        "Tranquil",
        "Momentous",
        "Nonchalant"
    ];
    string[] secondWords = [
        "Selfish",
        "Outstanding",
        "Sturdy",
        "Cooing",
        "Pushy",
        "Aggressive"
    ];
    string[] thirdWords = [
        "Bath",
        "Steak",
        "Piano",
        "Year",
        "Disaster",
        "Poet"
    ];

    event NewEpicNFTMinted(address sender, uint256 tokenId);

    constructor(uint256 totalSupply) ERC721("SquareNFT", "SQUARE") {
        console.log("This is my NFT contract. Whoa!");
        _totalSupply = totalSupply;
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getThreeRandomWords(uint256 tokenId)
        public
        view
        returns (string[3] memory)
    {
        uint256 rand1 = random(
            string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId)))
        );
        uint256 rand2 = random(
            string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId)))
        );
        uint256 rand3 = random(
            string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId)))
        );
        // return an array of three random words
        return [
            firstWords[rand1 % uint256(firstWords.length)],
            secondWords[rand2 % uint256(secondWords.length)],
            thirdWords[rand3 % uint256(thirdWords.length)]
        ];
    }

    function getTotalNFTsMintedSoFar() public view returns (uint256) {
        return _tokenIds.current();
    }

    function makeAnEpicNFT() public {
        require(
            getTotalNFTsMintedSoFar() < _totalSupply,
            string(
                abi.encodePacked(
                    "The total limit of ",
                    Strings.toString(_totalSupply),
                    " NFTs has been reached."
                )
            )
        );

        uint256 newItemId = _tokenIds.current();
        string[3] memory generatedWords = getThreeRandomWords(newItemId);
        string memory combinedWords = string(
            abi.encodePacked(
                generatedWords[0],
                generatedWords[1],
                generatedWords[2]
            )
        );
        string memory svg = string(
            abi.encodePacked(baseSvg, combinedWords, "</text></svg>")
        );
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        combinedWords,
                        '", "description": "A highly acclaimed collection of squares.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '"}'
                    )
                )
            )
        );
        string memory tokenUri = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        // Mint an NFT with id# newItemId to contract caller
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenUri);

        // console.log(tokenUri);
        console.log(
            "An NFT with ID %d has been minted to %s",
            newItemId,
            msg.sender
        );
        _tokenIds.increment();
        emit NewEpicNFTMinted(msg.sender, newItemId);
    }
}
